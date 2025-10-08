import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import { RichTextEditor, FormattedText } from '../RichTextEditor';

interface CommentActionsProps {
  comment: {
    id: string;
    text: string;
    added_by: string;
    author_role: string;
  };
  onUpdate: (commentId: string, newText: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  className?: string;
}

export function CommentActions({ comment, onUpdate, onDelete, className = "" }: CommentActionsProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user can edit/delete this comment
  const canEdit = user?.id === comment.added_by || user?.role === 'manager';
  const canDelete = user?.id === comment.added_by || user?.role === 'manager';

  const handleEdit = () => {
    setEditText(comment.text);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditText(comment.text);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editText.trim() || editText === '<p><br></p>') {
      alert('Please enter some text before saving.');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(comment.id, editText);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canEdit && !canDelete) {
    return null;
  }

  return (
    <div className={`comment-actions ${className}`}>
      {isEditing ? (
        <div className="space-y-3">
          <RichTextEditor
            value={editText}
            onChange={setEditText}
            placeholder="Edit your comment..."
            className="min-h-[100px]"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading || !editText.trim() || editText === '<p><br></p>'}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Save className="w-3 h-3" />
              <span>{isLoading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <X className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex space-x-2">
          {canEdit && (
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors flex items-center space-x-1"
            >
              <Edit2 className="w-3 h-3" />
              <span className="text-sm">Edit</span>
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="text-red-600 hover:text-red-800 disabled:text-gray-400 transition-colors flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span className="text-sm">Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Component for displaying comment content with actions
interface CommentDisplayProps {
  comment: {
    id: string;
    text: string;
    added_by: string;
    author_role: string;
  };
  onUpdate: (commentId: string, newText: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  className?: string;
}

export function CommentDisplay({ comment, onUpdate, onDelete, className = "" }: CommentDisplayProps) {
  return (
    <div className={`comment-display ${className}`}>
      <div className="comment-content">
        <FormattedText content={comment.text} />
      </div>
      <CommentActions
        comment={comment}
        onUpdate={onUpdate}
        onDelete={onDelete}
        className="mt-2"
      />
    </div>
  );
}
