import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Project } from '../../types';
import { Plus, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';

interface EmployeeTaskCreatorProps {
  onTaskCreated?: () => void;
  className?: string;
}

export function EmployeeTaskCreator({ onTaskCreated, className = "" }: EmployeeTaskCreatorProps) {
  const { user } = useAuth();
  const { projects, createTask } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    project_id: '',
    deadline: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Get projects assigned to current employee
  const assignedProjects = projects.filter(project => 
    project.assigned_employees.includes(user?.id || '')
  );

  const handleInputChange = (field: string, value: string) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!taskForm.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!taskForm.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!taskForm.project_id) {
      newErrors.project_id = 'Please select a project';
    }

    if (taskForm.deadline) {
      const deadlineDate = new Date(taskForm.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const taskData = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        project_id: taskForm.project_id,
        assigned_to: user?.id || '', // Employee creates task for themselves
        status: 'open' as const,
        priority: taskForm.priority,
        deadline: taskForm.deadline || undefined
      };

      await createTask(taskData);
      
      // Reset form
      setTaskForm({
        title: '',
        description: '',
        project_id: '',
        deadline: '',
        priority: 'medium'
      });
      
      setIsOpen(false);
      setErrors({});
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
      
      if (onTaskCreated) {
        onTaskCreated();
      }
      
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTaskForm({
      title: '',
      description: '',
      project_id: '',
      deadline: '',
      priority: 'medium'
    });
    setErrors({});
    setIsOpen(false);
  };

  if (assignedProjects.length === 0) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-800 font-medium">No Projects Assigned</p>
        </div>
        <p className="text-yellow-700 text-sm mt-1">
          You need to be assigned to at least one project to create tasks. Contact your manager to get assigned to projects.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Task created successfully!</p>
          </div>
        </div>
      )}
      
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Task</span>
        </button>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                value={taskForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter task title..."
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Task Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Task Description *
              </label>
              <textarea
                id="description"
                value={taskForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe what needs to be done..."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            {/* Project Selection */}
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-1">
                Project *
              </label>
              <select
                id="project_id"
                value={taskForm.project_id}
                onChange={(e) => handleInputChange('project_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.project_id ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value="">Select a project...</option>
                {assignedProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.project_id}</span>
                </p>
              )}
            </div>

            {/* Priority and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={taskForm.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={isLoading}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  id="deadline"
                  value={taskForm.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.deadline ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={isLoading}
                />
                {errors.deadline && (
                  <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.deadline}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Create Task</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
