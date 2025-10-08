import React from 'react';
import { Project } from '../../types';
import { Calendar, Users, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { user } = useAuth();

  const getThemeColors = () => {
    switch (user?.role) {
      case 'manager': return 'hover:border-blue-300 hover:shadow-blue-100';
      case 'employee': return 'hover:border-green-300 hover:shadow-green-100';
      case 'client': return 'hover:border-red-300 hover:shadow-red-100';
      default: return 'hover:border-gray-300 hover:shadow-gray-100';
    }
  };

  const getProgressColor = () => {
    switch (user?.role) {
      case 'manager': return 'bg-blue-500';
      case 'employee': return 'bg-green-500';
      case 'client': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      onClick={() => onClick(project)}
      className={`bg-white rounded-lg border border-gray-200 ${getThemeColors()} cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md p-4 sm:p-6`}
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 flex-1">{project.title}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0 ${
          project.status === 'active' ? 'bg-green-100 text-green-800' :
          project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {project.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">{project.description}</p>

      {project.project_type && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {project.project_type}
          </span>
        </div>
      )}

      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">Due: {formatDate(project.deadline)}</span>
        </div>

        {user?.role === 'manager' && (
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{project.assigned_employees.length} employee(s) assigned</span>
          </div>
        )}

        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>Progress: {project.progress_percentage}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProgressColor()} transition-all duration-300`}
            style={{ width: `${project.progress_percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}