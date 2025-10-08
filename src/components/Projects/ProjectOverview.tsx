import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { RichTextEditor, FormattedText } from '../RichTextEditor';
import { Save, Pencil, Trash2, FileText } from 'lucide-react';

interface ProjectOverviewProps {
  projectId: string;
}

export function ProjectOverview({ projectId }: ProjectOverviewProps) {
  const { user } = useAuth();
  const { getProjectOverview, saveProjectOverview, updateProjectOverview, deleteProjectOverview } = useData();

  const existing = useMemo(() => getProjectOverview(projectId), [projectId, getProjectOverview]);

  const [content, setContent] = useState<string>(existing?.content || '');
  const [isEditing, setIsEditing] = useState<boolean>(!existing);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const canEdit = Boolean(user);

  const handleSave = async () => {
    if (!canEdit || !content.trim() || content === '<p><br></p>') return;
    setIsSaving(true);
    try {
      if (existing) {
        await updateProjectOverview(projectId, content);
      } else {
        await saveProjectOverview({ project_id: projectId, content, created_by: user!.id });
      }
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (!confirm('Delete the Project Overview?')) return;
    setIsSaving(true);
    try {
      await deleteProjectOverview(projectId);
      setContent('');
      setIsEditing(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Project Overview</span>
        </h3>
        {!isEditing && existing && canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-2"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write a high-level overview, goals, constraints, and context..."
            className="min-h-[160px]"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || !content.trim() || content === '<p><br></p>'}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : existing ? 'Update' : 'Save'}</span>
            </button>
            {existing && (
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {existing ? (
            <div className="space-y-4">
              <FormattedText content={existing.content} />
              {canEdit && (
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Update</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 border-2 border-dashed border-gray-300 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No overview yet. Add one to get started.</p>
              {canEdit && (
                <button onClick={() => setIsEditing(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium">Add Overview</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectOverview;


