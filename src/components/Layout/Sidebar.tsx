import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FolderOpen,
  Users,
  BarChart3,
  Calendar,
  CheckSquare,
  Layers,
  Upload,
  MessageSquare,
  Eye,
  ListTodo,
  FileText,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getManagerMenuItems = () => [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'leads', label: 'Clients', icon: TrendingUp }
  ];

  const getEmployeeMenuItems = () => [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'mytasks', label: 'My Tasks', icon: ListTodo },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
  ];

  const getClientMenuItems = () => [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'project-overview', label: 'Project Overview', icon: Eye }
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'manager': return getManagerMenuItems();
      case 'employee': return getEmployeeMenuItems();
      case 'client': return getClientMenuItems();
      default: return [];
    }
  };

  const getThemeColors = () => {
    switch (user?.role) {
      case 'manager': return 'bg-blue-50 border-blue-200';
      case 'employee': return 'bg-green-50 border-green-200';
      case 'client': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getActiveColors = () => {
    switch (user?.role) {
      case 'manager': return 'bg-blue-600 text-white';
      case 'employee': return 'bg-green-600 text-white';
      case 'client': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const handleMenuItemClick = (viewId: string) => {
    onViewChange(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`fixed bottom-4 right-4 z-50 lg:hidden p-3 rounded-full shadow-lg ${getActiveColors()}`}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 ${getThemeColors()} border-r min-h-screen
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 sm:p-6">
          <nav className="space-y-2">
            {getMenuItems().map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${
                    isActive
                      ? getActiveColors()
                      : 'text-gray-700 hover:bg-white hover:bg-opacity-50'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}