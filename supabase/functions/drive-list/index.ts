import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { JWT } from 'npm:google-auth-library@9.14.1';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

async function getAccessToken(): Promise<string> {
  const email = Deno.env.get('GDRIVE_CLIENT_EMAIL');
  const key = Deno.env.get('GDRIVE_PRIVATE_KEY');
  if (!email || !key) throw new Error('Missing GDRIVE_CLIENT_EMAIL or GDRIVE_PRIVATE_KEY');
  const jwt = new JWT({ email, key, scopes: [DRIVE_SCOPE] });
  const { token } = await jwt.getAccessToken();
  if (!token) throw new Error('Failed to obtain access token');
  return token;
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  try {
    const accessToken = await getAccessToken();
    const body = await req.json().catch(() => ({}));
    const pageSize = Number(body.pageSize || 50);
    const folderId = Deno.env.get('GDRIVE_FOLDER_ID');
    if (!folderId) throw new Error('Missing GDRIVE_FOLDER_ID');

    const q = `'${folderId}' in parents and trashed = false`;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,createdTime,modifiedTime,webViewLink)&pageSize=${pageSize}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const txt = await res.text();
      return new Response(JSON.stringify({ error: `Drive list failed: ${res.status} ${txt}` }), { status: 500 });
    }

    const data = await res.json();
    return new Response(JSON.stringify({ files: data.files || [] }), { headers: { 'Content-Type': 'application/json' }, status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
  }
});



