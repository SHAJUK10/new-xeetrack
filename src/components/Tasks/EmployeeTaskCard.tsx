
import React from 'react';
import { Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Calendar } from 'lucide-react';

interface EmployeeTaskCardProps {
  task: Task;
  showProject?: boolean;
}

export function EmployeeTaskCard({ task, showProject = false }: EmployeeTaskCardProps) {
  const { user } = useAuth();
  const { updateTaskStatus, projects } = useData();

  const canUpdateStatus = user?.id === task.assigned_to;
  const project = projects.find(p => p.id === task.project_id);

  const handleCheckboxChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (canUpdateStatus) {
      const newStatus = e.target.checked ? 'done' : 'open';
      try {
        await updateTaskStatus(task.id, newStatus);
        console.log(`Task ${task.id} status updated to ${newStatus}`);
      } catch (error) {
        console.error('Error updating task status:', error);
        alert('Error updating task status. Please try again.');
      }
    }
  };

  return (
    <div className="w-[300px] rounded-lg border border-gray-200 p-3 bg-white transition-all hover:shadow-md m-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900 truncate">{task.title}</h4>
        {canUpdateStatus && (
          <input
            type="checkbox"
            checked={task.status === 'done'}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-green-600 cursor-pointer"
            title={task.status === 'done' ? 'Mark as incomplete' : 'Mark as complete'}
          />
        )}
      </div>
      {task.deadline && (
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <Calendar className="w-3 h-3" />
          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
        </div>
      )}
      {showProject && project && (
        <div className="text-xs text-gray-600 mt-2">
          <strong>Project:</strong> {project.title}
        </div>
      )}
      {!canUpdateStatus && (
        <div className="text-xs text-gray-500 mt-2">
          Assigned to: {task.assigned_to === user?.id ? 'You' : 'Another employee'}
        </div>
      )}
    </div>
  );
}