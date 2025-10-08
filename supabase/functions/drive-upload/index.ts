// Deno runtime (Supabase Edge Function)
// Uploads a file to Google Drive using a Service Account

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { JWT } from 'npm:google-auth-library@9.14.1';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

async function getAccessToken(): Promise<string> {
  const email = Deno.env.get('GDRIVE_CLIENT_EMAIL');
  const key = Deno.env.get('GDRIVE_PRIVATE_KEY');
  if (!email || !key) throw new Error('Missing GDRIVE_CLIENT_EMAIL or GDRIVE_PRIVATE_KEY');

  const jwtClient = new JWT({ email, key, scopes: [DRIVE_SCOPE] });
  const { token } = await jwtClient.getAccessToken();
  if (!token) throw new Error('Failed to obtain access token');
  return token;
}

async function ensureAnyoneRead(fileId: string, accessToken: string) {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' })
  });
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const accessToken = await getAccessToken();
    const form = await req.formData();

    const file = form.get('file');
    const projectId = String(form.get('projectId') || '');
    const stageId = String(form.get('stageId') || '');
    const folderId = Deno.env.get('GDRIVE_FOLDER_ID');
    if (!folderId) throw new Error('Missing GDRIVE_FOLDER_ID');

    if (!(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Metadata to attach; you can later query by appProperties
    const metadata: Record<string, unknown> = {
      name: (form.get('filename') as string) || 'upload',
      parents: [folderId],
      appProperties: { projectId, stageId }
    };

    const boundary = 'boundary-' + crypto.randomUUID();
    const metaPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
    const filePartHeader = `--${boundary}\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;
    const tail = `\r\n--${boundary}--`;

    const multipartBody = new Blob([
      metaPart,
      filePartHeader,
      file,
      tail
    ], { type: `multipart/related; boundary=${boundary}` });

    const uploadRes = await fetch(DRIVE_UPLOAD_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: multipartBody
    });

    if (!uploadRes.ok) {
      const txt = await uploadRes.text();
      return new Response(JSON.stringify({ error: `Drive upload failed: ${uploadRes.status} ${txt}` }), { status: 500 });
    }

    const uploaded = await uploadRes.json();
    const fileId = uploaded.id as string;

    // Make link shareable (optional)
    await ensureAnyoneRead(fileId, accessToken);

    const webViewLink = `https://drive.google.com/file/d/${fileId}/view`;

    return new Response(JSON.stringify({ fileId, webViewLink }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
  }
});



