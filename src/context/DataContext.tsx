
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, Stage, CommentTask, GlobalComment, File, Task, Meeting, BrochureProject, BrochurePage, PageComment, Lead, STAGE_NAMES, DownloadHistory, User, ProjectOverview } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { supabase as externalSupabase } from '../superBaseClient';
import { googleDriveService } from '../services/googleDriveService';

interface DataContextType {
  projects: Project[];
  stages: Stage[];
  commentTasks: CommentTask[];
  globalComments: GlobalComment[];
  users: User[];
  files: File[];
  tasks: Task[];
  meetings: Meeting[];
  brochureProjects: BrochureProject[];
  brochurePages: BrochurePage[];
  pageComments: PageComment[];
  leads: Lead[];
  downloadHistory: DownloadHistory[];
  projectOverviews: ProjectOverview[];
  getProjectOverview: (projectId: string) => ProjectOverview | null;
  saveProjectOverview: (params: { project_id: string; content: string; created_by: string }) => Promise<ProjectOverview>;
  updateProjectOverview: (projectId: string, content: string) => Promise<ProjectOverview | null>;
  deleteProjectOverview: (projectId: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'created_at'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  addCommentTask: (data: Omit<CommentTask, 'id' | 'timestamp'>) => void;
  addGlobalComment: (data: { project_id: string; text: string; added_by: string; author_role: string }) => void;
  updateCommentTaskStatus: (taskId: string, status: 'open' | 'in-progress' | 'done') => void;
  updateGlobalComment: (commentId: string, text: string) => Promise<void>;
  deleteGlobalComment: (commentId: string) => Promise<void>;
  updateCommentTask: (taskId: string, text: string) => Promise<void>;
  deleteCommentTask: (taskId: string) => Promise<void>;
  updateStageApproval: (stageId: string, status: 'approved' | 'rejected', comment?: string) => void;
  uploadFile: (fileData: Omit<File, 'id' | 'timestamp'>) => void;
  uploadFileFromInput: (stageId: string, file: globalThis.File, uploaderName: string) => Promise<void>;
  uploadFileToProject: (projectId: string, file: globalThis.File, uploaderName: string) => Promise<void>;
  uploadBrochureImage: (file: globalThis.File, projectId: string) => Promise<string>;
  updateStageProgress: (stageId: string, progress: number) => void;
  scheduleMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  createTask: (task: Omit<Task, 'id' | 'created_at'>) => void;
  updateTaskStatus: (taskId: string, status: 'open' | 'in-progress' | 'done') => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  createBrochureProject: (projectId: string, clientId: string, clientName: string) => Promise<BrochureProject | null>;
  updateBrochureProject: (id: string, updates: Partial<BrochureProject>) => void;
  deleteBrochurePage: (projectId: string, pageNumber: number) => Promise<void>;
  saveBrochurePage: (pageData: { project_id: string; page_number: number; content: BrochurePage['content']; approval_status?: 'pending' | 'approved' | 'rejected'; is_locked?: boolean }) => Promise<void>;
  getBrochurePages: (projectId: string) => BrochurePage[];
  addPageComment: (comment: Omit<PageComment, 'id' | 'timestamp'>) => void;
  getPageComments: (pageId: string) => PageComment[];
  markCommentDone: (commentId: string) => void;
  downloadFile: (fileId: string) => void;
  downloadMultipleFiles: (fileIds: string[]) => void;
  getDownloadHistory: () => DownloadHistory[];
  updateFileMetadata: (fileId: string, metadata: Partial<File>) => void;
  createLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  approveBrochurePage: (pageId: string, status: 'approved' | 'rejected', comment?: string) => void;
  getBrochureProjectsForReview: () => BrochureProject[];
  lockBrochurePage: (pageId: string) => void;
  unlockBrochurePage: (pageId: string) => void;
  createUserAccount: (params: { email: string; password: string; full_name: string; role: 'employee' | 'client' }) => Promise<{ id: string } | null>;
  refreshUsers: () => Promise<void>;
  loadProjects: () => Promise<void>;
  loadFiles: () => Promise<void>;
  deleteFile: (fileId: string, storagePath: string) => Promise<void>;
  loadGlobalComments: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

// Supabase client
let supabase: SupabaseClient | null = externalSupabase;

// Get Supabase URL for file URLs
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Mock data (unchanged)
const mockProjects: Project[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Website for Xee Design',
    description: 'Complete website redesign and development for Xee Design agency with modern UI/UX, responsive design, and CMS integration',
    client_id: '550e8400-e29b-41d4-a716-446655440003',
    client_name: 'Priya Sharma',
    deadline: '2025-03-15',
    progress_percentage: 65,
    assigned_employees: ['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004'],
    created_at: '2025-01-01',
    status: 'active',
    priority: 'high'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'E-commerce Mobile App',
    description: 'Native mobile application for online shopping with payment gateway integration and inventory management',
    client_id: '550e8400-e29b-41d4-a716-446655440005',
    client_name: 'Rajesh Kumar',
    deadline: '2025-04-30',
    progress_percentage: 30,
    assigned_employees: ['550e8400-e29b-41d4-a716-446655440002'],
    created_at: '2025-01-10',
    status: 'active',
    priority: 'medium'
  }
];

const mockStages: Stage[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    project_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Planning',
    notes: 'Project requirements gathering, wireframes, and technical specifications completed',
    progress_percentage: 100,
    approval_status: 'approved',
    files: [],
    comments: [],
    order: 0
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    project_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Design',
    notes: 'UI/UX design mockups and prototypes ready for client review',
    progress_percentage: 90,
    approval_status: 'pending',
    files: [],
    comments: [],
    order: 1
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    project_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Development',
    notes: 'Frontend development in progress, backend API integration started',
    progress_percentage: 45,
    approval_status: 'pending',
    files: [],
    comments: [],
    order: 2
  }
];

const mockCommentTasks: CommentTask[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440021',
    stage_id: '550e8400-e29b-41d4-a716-446655440012',
    project_id: '550e8400-e29b-41d4-a716-446655440001',
    text: 'Please update the color scheme to match our brand guidelines. The current blue is too dark.',
    added_by: '550e8400-e29b-41d4-a716-446655440003',
    author_name: 'Priya Sharma',
    author_role: 'client',
    status: 'open',
    assigned_to: '550e8400-e29b-41d4-a716-446655440002',
    timestamp: '2025-01-15T10:30:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440022',
    stage_id: '550e8400-e29b-41d4-a716-446655440013',
    project_id: '550e8400-e29b-41d4-a716-446655440001',
    text: 'Need to implement responsive design for mobile devices',
    added_by: '550e8400-e29b-41d4-a716-446655440001',
    author_name: 'Arjun Singh',
    author_role: 'manager',
    status: 'in-progress',
    assigned_to: '550e8400-e29b-41d4-a716-446655440002',
    deadline: '2025-02-01',
    timestamp: '2025-01-12T14:20:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440023',
    stage_id: '550e8400-e29b-41d4-a716-446655440013',
    project_id: '550e8400-e29b-41d4-a716-446655440001',
    text: 'Database optimization completed, performance improved by 40%',
    added_by: '550e8400-e29b-41d4-a716-446655440002',
    author_name: 'Rakesh Gupta',
    author_role: 'employee',
    status: 'done',
    timestamp: '2025-01-14T16:45:00Z'
  }
];

const mockFiles: File[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440031',
    stage_id: '550e8400-e29b-41d4-a716-446655440011',
    project_id: '550e8400-e29b-41d4-a716-446655440001',
    filename: 'project-requirements.pdf',
    file_url: '#',
    uploaded_by: '550e8400-e29b-41d4-a716-446655440001',
    uploader_name: 'Arjun Singh',
    timestamp: '2025-01-02T09:00:00Z',
    size: 2048576,
    file_type: 'pdf',
    category: 'requirements',
    description: 'Initial project requirements and specifications',
    download_count: 5,
    last_downloaded: '2025-01-15T14:30:00Z',
    last_downloaded_by: '550e8400-e29b-41d4-a716-446655440002',
    is_archived: false,
    tags: ['requirements', 'initial', 'specifications']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440032',
    stage_id: '550e8400-e29b-41d4-a716-446655440012',
    project_id: '550e8400-e29b-41d4-a716-446655440001',
    filename: 'design-mockups.fig',
    file_url: '#',
    uploaded_by: '550e8400-e29b-41d4-a716-446655440002',
    uploader_name: 'Rakesh Gupta',
    timestamp: '2025-01-08T11:15:00Z',
    size: 5242880,
    file_type: 'fig',
    category: 'assets',
    description: 'Figma design mockups for homepage and key pages',
    download_count: 3,
    last_downloaded: '2025-01-14T16:20:00Z',
    last_downloaded_by: '550e8400-e29b-41d4-a716-446655440003',
    is_archived: false,
    tags: ['design', 'mockups', 'figma']
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [stages, setStages] = useState<Stage[]>(mockStages);
  const [commentTasks, setCommentTasks] = useState<CommentTask[]>(mockCommentTasks);
  const [globalComments, setGlobalComments] = useState<GlobalComment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<File[]>(mockFiles);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [brochureProjects, setBrochureProjects] = useState<BrochureProject[]>([]);
  const [brochurePages, setBrochurePages] = useState<BrochurePage[]>([]);
  const [pageComments, setPageComments] = useState<PageComment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([]);
  const [projectOverviews, setProjectOverviews] = useState<ProjectOverview[]>([]);
  const [accessibleProjectIds, setAccessibleProjectIds] = useState<string[] | null>(null);

  // Load project overviews from database
  const loadProjectOverviews = useCallback(async (projectIds?: string[]) => {
    if (!externalSupabase || !user) {
      console.warn('Supabase or user not available - cannot load project overviews');
      return;
    }

    try {
      console.log('Loading project overviews');
      let query = externalSupabase.from('project_overviews').select('*');
      const ids = projectIds || accessibleProjectIds || undefined;
      if (ids && ids.length > 0) {
        query = query.in('project_id', ids);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error loading project overviews:', error);
        return;
      }

      const mapped: ProjectOverview[] = (data || []).map((row: any) => ({
        project_id: row.project_id,
        content: row.content,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      setProjectOverviews(mapped);
      console.log('Project overviews loaded:', mapped.length);
    } catch (error) {
      console.error('Error loading project overviews:', error);
    }
  }, [externalSupabase, user, accessibleProjectIds]);

  const loadStages = useCallback(async () => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot load stages');
      return;
    }

    try {
      console.log('Loading stages from database');
      
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        console.error('Error loading stages:', error);
        return;
      }

      if (data) {
        const mappedStages: Stage[] = data.map(stage => ({
          id: stage.id,
          project_id: stage.project_id,
          name: stage.name,
          notes: stage.notes || '',
          progress_percentage: stage.progress_percentage || 0,
          approval_status: stage.approval_status || 'pending',
          files: [],
          comments: [],
          order: stage.order || 0
        }));
        
        setStages(mappedStages);
        console.log('Stages loaded successfully:', mappedStages.length);
      }
    } catch (error) {
      console.error('Error loading stages:', error);
    }
  }, [supabase, user]);

  // Load projects from database
  const loadProjects = useCallback(async () => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot load projects');
      return [];
    }

    try {
      console.log('Loading projects for user:', user.id, 'Role:', user.role);

      let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

      // Apply role-based filtering
      if (user.role === 'client') {
        query = query.eq('client_id', user.id);
      } else if (user.role === 'employee') {
        // For employees, we need to check assigned_employees array
        query = query.contains('assigned_employees', [user.id]);
      }
      // Managers can see all projects (no additional filter)

      const { data, error } = await query;

      if (error) {
        console.error('Error loading projects:', error);
        if (error.message?.includes('Failed to fetch')) {
          console.error('Database connection failed. Please verify your Supabase URL and anon key are valid.');
        }
        return [];
      }

      if (data) {
        const mappedProjects: Project[] = data.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          client_id: project.client_id,
          client_name: project.client_name,
          deadline: project.deadline,
          progress_percentage: project.progress_percentage || 0,
          assigned_employees: project.assigned_employees || [],
          created_at: project.created_at,
          status: project.status || 'active',
          priority: project.priority || 'medium',
          project_type: project.project_type || undefined
        }));

        setProjects(mappedProjects);
        console.log('Projects loaded successfully:', mappedProjects.length);
        return mappedProjects;
      }
    } catch (error: any) {
      console.error('Error loading projects:', error);
      if (error?.message?.includes('Failed to fetch')) {
        console.error('Database connection failed. Please check your Supabase configuration in the .env file.');
      }
    }
    return [];
  }, [supabase, user]);

  // Load users from database
  const refreshUsers = useCallback(async () => {
    if (!supabase) {
      console.warn('Supabase not configured - cannot load users');
      return;
    }

    try {
      console.log('Loading users from database');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      if (data) {
        const mappedUsers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.full_name || profile.email || 'Unknown User',
          email: profile.email || '',
          role: profile.role || 'employee'
        }));
        
        setUsers(mappedUsers);
        console.log('Users loaded successfully:', mappedUsers.length);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }, [supabase]);

  // Fetch accessible project IDs based on user role
  const fetchAccessibleProjectIds = useCallback(async () => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available');
      return [];
    }

    try {
      console.log('Fetching accessible project IDs for user:', user.id, 'Role:', user.role);
      if (user.role === 'client') {
        // Client can access only their projects
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .eq('client_id', user.id);
        if (error) {
          console.error('Error fetching client-accessible projects:', error);
          if (error.message?.includes('Failed to fetch')) {
            console.error('Database connection failed. Please verify your Supabase configuration.');
          }
          return [];
        }
        return (data || []).map((p: any) => p.id as string);
      } else if (user.role === 'employee') {
        // Employee can access projects where they are assigned (using contains operator on assigned_employees array)
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .contains('assigned_employees', [user.id]);
        if (error) {
          console.error('Error fetching employee-accessible projects:', error);
          if (error.message?.includes('Failed to fetch')) {
            console.error('Database connection failed. Please verify your Supabase configuration.');
          }
          return [];
        }
        return (data || []).map((p: any) => p.id as string);
      } else if (user.role === 'manager') {
        // Manager can access all projects
        const { data, error } = await supabase
          .from('projects')
          .select('id');
        if (error) {
          console.error('Error fetching manager-accessible projects:', error);
          if (error.message?.includes('Failed to fetch')) {
            console.error('Database connection failed. Please verify your Supabase configuration.');
          }
          return [];
        }
        return (data || []).map((p: any) => p.id as string);
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching accessible project IDs:', error);
      if (error?.message?.includes('Failed to fetch')) {
        console.error('Database connection failed. Please verify your Supabase URL and anon key in .env file.');
      }
      return [];
    }
  }, [supabase, user]);

  // Load global comments from database
  const loadGlobalComments = useCallback(async (userProjects?: Project[]) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available');
      return;
    }

    try {
      console.log('Loading global comments for user:', user.id, 'Role:', user.role);
      const projectIds = await fetchAccessibleProjectIds();
      
      if (projectIds.length === 0) {
        console.log('No accessible projects found for user');
        setGlobalComments([]);
        return;
      }

      const { data, error } = await supabase
        .from('global_comments')
        .select('*')
        .in('project_id', projectIds)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error loading global comments:', error);
        return;
      }

      if (data) {
        const mappedComments: GlobalComment[] = data.map(comment => ({
          id: comment.id,
          project_id: comment.project_id,
          text: comment.text,
          added_by: comment.added_by,
          author_name: comment.author_name || 'Unknown',
          author_role: comment.author_role,
          timestamp: comment.timestamp
        }));
        
        setGlobalComments(mappedComments);
        console.log('Global comments loaded successfully:', mappedComments.length);
      }
    } catch (error) {
      console.error('Error loading global comments:', error);
    }
  }, [supabase, user, fetchAccessibleProjectIds]);

  // Create new project
  const createProject = async (project: Omit<Project, 'id' | 'created_at'>) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot create project');
      return;
    }

    try {
      console.log('Creating new project:', project.title);
      
      const projectData = {
        title: project.title,
        description: project.description,
        client_id: project.client_id,
        client_name: project.client_name,
        deadline: project.deadline,
        progress_percentage: project.progress_percentage || 0,
        assigned_employees: project.assigned_employees || [],
        status: project.status || 'active',
        priority: project.priority || 'medium',
        project_type: project.project_type || null
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      console.log('Project created successfully:', data.id);
      
      // Reload projects to update the UI
      await loadProjects();
      
      // Create default stages for the new project
      await createDefaultStages(data.id);
      
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  // Update existing project
  const updateProject = async (id: string, updates: Partial<Project>, updatingUser?: User) => {
    if (!supabase) {
      console.warn('Supabase not configured - cannot update project');
      return;
    }

    try {
      console.log('Updating project:', id, updates);
      
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }

      console.log('Project updated successfully:', data.id);
      
      // Reload projects to update the UI
      await loadProjects();
      
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  // Create default stages for a new project
  const createDefaultStages = async (projectId: string) => {
    if (!supabase) return;

    try {
      console.log('Creating default stages for project:', projectId);
      
      const defaultStages = STAGE_NAMES.map((name, index) => ({
        project_id: projectId,
        name,
        notes: `${name} stage for the project`,
        progress_percentage: 0,
        approval_status: 'pending' as const,
        order: index
      }));

      const { error } = await supabase
        .from('stages')
        .insert(defaultStages);

      if (error) {
        console.error('Error creating default stages:', error);
      } else {
        console.log('Default stages created successfully');
      }
    } catch (error) {
      console.error('Error creating default stages:', error);
    }
  };

  // Load files from database
  const loadFiles = useCallback(async () => {
    if (!supabase) {
      console.warn('Supabase not configured - cannot load files');
      return;
    }

    try {
      console.log('Loading files from database with Supabase URL:', supabaseUrl);
      const query = supabase.from('files').select('*').order('timestamp', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error loading files:', error);
        return;
      }

      if (data) {
        const mappedFiles: File[] = data.map(file => ({
          id: file.id,
          stage_id: file.stage_id,
          project_id: file.project_id,
          filename: file.filename,
          file_url: file.file_url,
          storage_path: file.storage_path,
          uploaded_by: file.uploaded_by,
          uploader_name: file.uploader_name || 'Unknown',
          timestamp: file.timestamp,
          size: file.size,
          file_type: file.file_type,
          category: file.category,
          description: file.description,
          download_count: file.download_count || 0,
          last_downloaded: file.last_downloaded,
          last_downloaded_by: file.last_downloaded_by,
          is_archived: file.is_archived || false,
          tags: file.tags || []
        }));
        
        setFiles(mappedFiles);
        console.log('Files loaded successfully:', mappedFiles.length);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      console.warn('Failed to connect to Supabase. Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
      console.warn('Using mock files data instead.');
    }
  }, [supabase]);

  // Load tasks from database
  const loadTasks = useCallback(async (userProjects?: Project[]) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot load tasks');
      return;
    }

    try {
      console.log('Loading tasks for user:', user.id, 'Role:', user.role);
      
      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      
      // Apply role-based filtering
      if (user.role === 'client') {
        // Clients can see tasks in their projects
        const clientProjects = (userProjects || projects).map(p => p.id);
        if (clientProjects.length > 0) {
          query = query.in('project_id', clientProjects);
        } else {
          // No projects, no tasks
          setTasks([]);
          return;
        }
      } else if (user.role === 'employee') {
        // Employees can see tasks assigned to them or in their assigned projects
        const assignedProjects = (userProjects || projects).filter(p => p.assigned_employees.includes(user.id)).map(p => p.id);
        if (assignedProjects.length > 0) {
          query = query.or(`assigned_to.eq.${user.id},and(project_id.in.(${assignedProjects.join(',')}))`);
        } else {
          query = query.eq('assigned_to', user.id);
        }
      }
      // Managers can see all tasks (no additional filter)

      const { data, error } = await query;

      if (error) {
        console.error('Error loading tasks:', error);
        return;
      }

      if (data) {
        const mappedTasks: Task[] = data.map(task => ({
          id: task.id,
          project_id: task.project_id,
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to,
          created_by: task.created_by || task.assigned_to,
          status: task.status || 'open',
          priority: task.priority || 'medium',
          deadline: task.deadline,
          updated_at: task.updated_at
        }));
        
        setTasks(mappedTasks);
        console.log('Tasks loaded successfully:', mappedTasks.length);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      console.warn('Failed to load tasks from Supabase. Using existing task data.');
    }
  }, [supabase, user, projects]);

  // Refresh tasks function
  const refreshTasks = useCallback(async () => {
    await loadTasks();
  }, [loadTasks]);

  // Upload file from input
  const uploadFileFromInput = async (stageId: string, file: globalThis.File, uploaderName: string) => {
    if (!user) {
      console.warn('User not available');
      return;
    }

    // Find project ID from stage ID
    const stage = stages.find(s => s.id === stageId);
    const projectId = stage?.project_id;
    
    if (!projectId) {
      console.error('Could not find project ID for stage:', stageId);
      return;
    }

    try {
      // Verify user has access to the project
      const projectIds = await fetchAccessibleProjectIds();
      if (!projectIds?.includes(projectId)) {
        throw new Error('Unauthorized access to project');
      }

      // Upload file to Google Drive
      console.log('Uploading file to Google Drive:', file.name, 'Project:', projectId);
      const uploadResult = await googleDriveService.uploadFile(file, projectId, stageId);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload file to Google Drive');
      }

      // Save file metadata to database
      const fileData: Omit<File, 'id' | 'timestamp'> = {
        stage_id: stageId,
        project_id: projectId,
        filename: file.name,
        file_url: uploadResult.webViewLink || googleDriveService.getBaseFolderUrl(),
        storage_path: uploadResult.fileId || `google_drive_${Date.now()}`,
        uploaded_by: user.id,
        uploader_name: uploaderName,
        size: file.size,
        file_type: file.type,
        category: file.type.split('/')[0],
        description: '',
        download_count: 0,
        last_downloaded: null,
        last_downloaded_by: null,
        is_archived: false,
        tags: []
      };

      if (supabase) {
        console.log('Inserting file metadata to database:', fileData);
        const { data: insertData, error: dbError } = await supabase.from('files').insert(fileData).select();
        if (dbError) {
          console.error('Database error inserting file metadata:', dbError);
          throw dbError;
        }
        console.log('File metadata inserted successfully:', insertData);
      } else {
        console.warn('Supabase not available, cannot save file metadata');
      }

      // Reload files for the project
      await loadFiles();
      console.log('File uploaded successfully to Google Drive:', file.name);
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      throw error;
    }
  };

  // Upload file directly to a project (no stage required)
  const uploadFileToProject = async (projectId: string, file: globalThis.File, uploaderName: string) => {
    if (!user) {
      console.warn('User not available');
      return;
    }

    try {
      const projectIds = await fetchAccessibleProjectIds();
      if (!projectIds?.includes(projectId)) {
        throw new Error('Unauthorized access to project');
      }

      console.log('Uploading file to Google Drive (project-level):', file.name, 'Project:', projectId);
      const uploadResult = await googleDriveService.uploadFile(file, projectId);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload file to Google Drive');
      }

      const fileData: Omit<File, 'id' | 'timestamp'> = {
        project_id: projectId,
        filename: file.name,
        file_url: uploadResult.webViewLink || googleDriveService.getBaseFolderUrl(),
        storage_path: uploadResult.fileId || `google_drive_${Date.now()}`,
        uploaded_by: user.id,
        uploader_name: uploaderName,
        size: file.size,
        file_type: file.type,
        category: file.type.split('/')[0],
        description: '',
        download_count: 0,
        last_downloaded: null,
        last_downloaded_by: null,
        is_archived: false,
        tags: []
      };

      if (supabase) {
        const { error: dbError } = await supabase.from('files').insert(fileData);
        if (dbError) {
          console.error('Database error inserting file metadata:', dbError);
          throw dbError;
        }
      }

      await loadFiles();
      console.log('File uploaded successfully to Google Drive (project-level):', file.name);
    } catch (error) {
      console.error('Error uploading file to Google Drive (project-level):', error);
      throw error;
    }
  };

  // Delete file from Google Drive and database
  const deleteFile = async (fileId: string, storagePath: string) => {
    if (!user) {
      console.warn('User not available');
      return;
    }

    try {
      // Verify user has access to the project
      const file = files.find(f => f.id === fileId);
      if (!file || !(await fetchAccessibleProjectIds())?.includes(file.project_id)) {
        throw new Error('Unauthorized access to file');
      }

      // Delete from Google Drive
      console.log('Deleting file from Google Drive:', storagePath);
      const deleteSuccess = await googleDriveService.deleteFile(storagePath);
      if (!deleteSuccess) {
        console.warn('Failed to delete file from Google Drive, but continuing with database deletion');
      }

      // Delete from database
      if (supabase) {
        const { error: dbError } = await supabase
          .from('files')
          .delete()
          .eq('id', fileId);
        if (dbError) {
          console.error('Database error deleting file:', dbError);
          throw dbError;
        }
      }

      // Reload files to update UI
      await loadFiles();
      console.log('File deleted successfully from Google Drive:', fileId);
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw error;
    }
  };

  // Placeholder implementations for other context methods
  const addCommentTask = (data: Omit<CommentTask, 'id' | 'timestamp'>) => {
    const newTask: CommentTask = {
      ...data,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    setCommentTasks(prev => [...prev, newTask]);
  };
  
  const addGlobalComment = (data: { project_id: string; text: string; added_by: string; author_role: string }) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot add global comment');
      return;
    }

    const addCommentAsync = async () => {
      try {
        console.log('Adding global comment to project:', data.project_id);
        
        const commentData = {
          project_id: data.project_id,
          text: data.text,
          added_by: user.id,
          author_name: user.name,
          author_role: user.role
        };

        const { data: insertData, error } = await supabase
          .from('global_comments')
          .insert(commentData)
          .select()
          .single();

        if (error) {
          console.error('Error adding global comment:', error);
          throw error;
        }

        console.log('Global comment added successfully:', insertData.id);
        
        // Reload global comments to update the UI
        await loadGlobalComments();
        
      } catch (error) {
        console.error('Error adding global comment:', error);
        throw error;
      }
    };

    return addCommentAsync();
  };
  
  const updateCommentTaskStatus = (taskId: string, status: 'open' | 'in-progress' | 'done') => {
    setCommentTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, status } : task
      )
    );
  };

  // Update global comment
  const updateGlobalComment = async (commentId: string, text: string) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot update global comment');
      return;
    }

    try {
      console.log('Updating global comment:', commentId);
      
      const { data, error } = await supabase
        .from('global_comments')
        .update({ text })
        .eq('id', commentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating global comment:', error);
        throw error;
      }

      console.log('Global comment updated successfully:', data.id);
      
      // Reload global comments to update the UI
      await loadGlobalComments();
      
    } catch (error) {
      console.error('Error updating global comment:', error);
      throw error;
    }
  };

  // Delete global comment
  const deleteGlobalComment = async (commentId: string) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot delete global comment');
      return;
    }

    try {
      console.log('Deleting global comment:', commentId);
      
      const { error } = await supabase
        .from('global_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting global comment:', error);
        throw error;
      }

      console.log('Global comment deleted successfully:', commentId);
      
      // Reload global comments to update the UI
      await loadGlobalComments();
      
    } catch (error) {
      console.error('Error deleting global comment:', error);
      throw error;
    }
  };

  // Update comment task
  const updateCommentTask = async (taskId: string, text: string) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot update comment task');
      return;
    }

    try {
      console.log('Updating comment task:', taskId);
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ description: text })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating comment task:', error);
        throw error;
      }

      console.log('Comment task updated successfully:', data.id);
      
      // Update local state
      setCommentTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, text } : task
        )
      );
      
    } catch (error) {
      console.error('Error updating comment task:', error);
      throw error;
    }
  };

  // Delete comment task
  const deleteCommentTask = async (taskId: string) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot delete comment task');
      return;
    }

    try {
      console.log('Deleting comment task:', taskId);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting comment task:', error);
        throw error;
      }

      console.log('Comment task deleted successfully:', taskId);
      
      // Update local state
      setCommentTasks(prev => prev.filter(task => task.id !== taskId));
      
    } catch (error) {
      console.error('Error deleting comment task:', error);
      throw error;
    }
  };
  
  const updateStageApproval = (stageId: string, status: 'approved' | 'rejected', comment?: string) => {
    setStages(prev => 
      prev.map(stage => 
        stage.id === stageId ? { ...stage, approval_status: status } : stage
      )
    );
  };
  
  const uploadFile = (fileData: Omit<File, 'id' | 'timestamp'>) => {
    const newFile: File = {
      ...fileData,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    setFiles(prev => [...prev, newFile]);
  };
  
  const uploadBrochureImage = async (file: globalThis.File, projectId: string) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const storagePath = `brochures/${projectId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('brochure-images')
        .upload(storagePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('brochure-images')
        .getPublicUrl(storagePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading brochure image:', error);
      throw error;
    }
  };
  
  const updateStageProgress = (stageId: string, progress: number) => {
    setStages(prev => 
      prev.map(stage => 
        stage.id === stageId ? { ...stage, progress_percentage: progress } : stage
      )
    );
  };
  
  const scheduleMeeting = (meeting: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...meeting,
      id: uuidv4()
    };
    setMeetings(prev => [...prev, newMeeting]);
  };
  
  const createTask = async (task: Omit<Task, 'id' | 'created_at'>) => {
    if (!supabase || !user) {
      console.warn('Supabase or user not available - cannot create task');
      return;
    }

    try {
      console.log('Creating new task:', task.title);
      
      const taskData = {
        project_id: task.project_id,
        title: task.title,
        description: task.description,
        assigned_to: task.assigned_to,
        created_by: user.id,
        status: task.status || 'open',
        priority: task.priority || 'medium',
        deadline: task.deadline || null
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      console.log('Task created successfully:', data.id);
      
      // Reload tasks to update the UI
      await loadTasks();
      
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };
  
  const updateTaskStatus = (taskId: string, status: 'open' | 'in-progress' | 'done') => {
    if (!supabase) {
      console.warn('Supabase not configured - cannot update task status');
      return;
    }

    const updateTaskStatusAsync = async () => {
      try {
        console.log('Updating task status:', taskId, status);
        
        const { data, error } = await supabase
          .from('tasks')
          .update({ status })
          .eq('id', taskId)
          .select()
          .single();

        if (error) {
          console.error('Error updating task status:', error);
          throw error;
        }

        console.log('Task status updated successfully:', data.id);
        
        // Reload tasks to update the UI
        await loadTasks();
        
      } catch (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
    };

    return updateTaskStatusAsync();
  };
  
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!supabase) {
      console.warn('Supabase not configured - cannot update task');
      return;
    }

    try {
      console.log('Updating task:', taskId, updates);
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      console.log('Task updated successfully:', data.id);
      
      // Reload tasks to update the UI
      await loadTasks();
      
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };
  
  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };
  
  const createBrochureProject = async (projectId: string, clientId: string, clientName: string) => {
    const newBrochureProject: BrochureProject = {
      id: uuidv4(),
      client_id: clientId,
      project_id: projectId,
      client_name: clientName,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      pages: []
    };
    setBrochureProjects(prev => [...prev, newBrochureProject]);
    return newBrochureProject;
  };
  
  const updateBrochureProject = (id: string, updates: Partial<BrochureProject>) => {
    setBrochureProjects(prev => 
      prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };
  
  const deleteBrochurePage = async (projectId: string, pageNumber: number) => {
    setBrochurePages(prev => 
      prev.filter(page => 
        !(page.project_id === projectId && page.page_number === pageNumber)
      )
    );
  };
  
  const saveBrochurePage = async (pageData: { project_id: string; page_number: number; content: BrochurePage['content']; approval_status?: 'pending' | 'approved' | 'rejected'; is_locked?: boolean }) => {
    const existingPageIndex = brochurePages.findIndex(
      page => page.project_id === pageData.project_id && page.page_number === pageData.page_number
    );

    if (existingPageIndex >= 0) {
      setBrochurePages(prev => 
        prev.map((page, index) => 
          index === existingPageIndex 
            ? { ...page, content: pageData.content, updated_at: new Date().toISOString() }
            : page
        )
      );
    } else {
      const newPage: BrochurePage = {
        id: uuidv4(),
        project_id: pageData.project_id,
        page_number: pageData.page_number,
        approval_status: pageData.approval_status || 'pending',
        is_locked: pageData.is_locked || false,
        content: pageData.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setBrochurePages(prev => [...prev, newPage]);
    }
  };
  
  const getBrochurePages = (projectId: string) => {
    return brochurePages.filter(page => page.project_id === projectId);
  };
  
  const addPageComment = (comment: Omit<PageComment, 'id' | 'timestamp'>) => {
    const newComment: PageComment = {
      ...comment,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    setPageComments(prev => [...prev, newComment]);
  };
  
  const getPageComments = (pageId: string) => {
    return pageComments.filter(comment => comment.page_id === pageId);
  };
  
  const markCommentDone = (commentId: string) => {
    setPageComments(prev => 
      prev.map(comment => 
        comment.id === commentId ? { ...comment, marked_done: true } : comment
      )
    );
  };

  // Project Overview CRUD
  const getProjectOverview = (projectId: string) => {
    const existing = projectOverviews.find(po => po.project_id === projectId);
    return existing || null;
  };

  const saveProjectOverview = async (params: { project_id: string; content: string; created_by: string }): Promise<ProjectOverview> => {
    const existing = projectOverviews.find(po => po.project_id === params.project_id);
    if (existing) {
      return updateProjectOverview(params.project_id, params.content) as Promise<ProjectOverview>;
    }

    const newOverview: ProjectOverview = {
      project_id: params.project_id,
      content: params.content,
      created_by: params.created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setProjectOverviews(prev => [...prev, newOverview]);

    try {
      if (externalSupabase) {
        const { error } = await externalSupabase
          .from('project_overviews')
          .upsert({
            project_id: newOverview.project_id,
            content: newOverview.content,
            created_by: newOverview.created_by
          }, { onConflict: 'project_id' });
        if (error) {
          console.error('Supabase upsert project_overviews failed:', error.message);
          throw error;
        }
      }
    } catch (e) {
      console.error('Error saving project overview to Supabase:', e);
    }

    return newOverview;
  };

  const updateProjectOverview = async (projectId: string, content: string): Promise<ProjectOverview | null> => {
    const existing = projectOverviews.find(po => po.project_id === projectId);
    if (!existing) return null;

    const updated: ProjectOverview = { ...existing, content, updated_at: new Date().toISOString() };
    setProjectOverviews(prev => prev.map(po => po.project_id === projectId ? updated : po));

    try {
      if (externalSupabase) {
        const { error } = await externalSupabase
          .from('project_overviews')
          .update({ content })
          .eq('project_id', projectId);
        if (error) {
          console.error('Supabase update project_overviews failed:', error.message);
          throw error;
        }
      }
    } catch (e) {
      console.error('Error updating project overview in Supabase:', e);
    }

    return updated;
  };

  const deleteProjectOverview = async (projectId: string): Promise<void> => {
    setProjectOverviews(prev => prev.filter(po => po.project_id !== projectId));
    try {
      if (externalSupabase) {
        const { error } = await externalSupabase
          .from('project_overviews')
          .delete()
          .eq('project_id', projectId);
        if (error) {
          console.error('Supabase delete project_overviews failed:', error.message);
          throw error;
        }
      }
    } catch (e) {
      console.error('Error deleting project overview from Supabase:', e);
    }
  };
  
  const downloadFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      const link = document.createElement('a');
      link.href = file.file_url;
      link.download = file.filename;
      link.click();
      
      // Update download count
      setFiles(prev => 
        prev.map(f => 
          f.id === fileId 
            ? { ...f, download_count: f.download_count + 1, last_downloaded: new Date().toISOString() }
            : f
        )
      );
    }
  };
  
  const downloadMultipleFiles = (fileIds: string[]) => {
    fileIds.forEach(fileId => downloadFile(fileId));
  };
  
  const getDownloadHistory = () => {
    return downloadHistory;
  };
  
  const updateFileMetadata = (fileId: string, metadata: Partial<File>) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, ...metadata } : file
      )
    );
  };
  
  const createLead = (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    const newLead: Lead = {
      ...lead,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setLeads(prev => [...prev, newLead]);
  };
  
  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => 
      prev.map(lead => 
        lead.id === id ? { ...lead, ...updates, updated_at: new Date().toISOString() } : lead
      )
    );
  };
  
  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(lead => lead.id !== id));
  };
  
  const approveBrochurePage = (pageId: string, status: 'approved' | 'rejected', comment?: string) => {
    setBrochurePages(prev => 
      prev.map(page => 
        page.id === pageId ? { ...page, approval_status: status } : page
      )
    );
  };
  
  const getBrochureProjectsForReview = () => {
    return brochureProjects.filter(project => 
      project.status === 'ready_for_design' || project.status === 'in_design'
    );
  };
  
  const lockBrochurePage = (pageId: string) => {
    setBrochurePages(prev => 
      prev.map(page => 
        page.id === pageId 
          ? { 
              ...page, 
              is_locked: true, 
              locked_by: user?.id,
              locked_by_name: user?.name,
              locked_at: new Date().toISOString()
            } 
          : page
      )
    );
  };
  
  const unlockBrochurePage = (pageId: string) => {
    setBrochurePages(prev => 
      prev.map(page => 
        page.id === pageId 
          ? { 
              ...page, 
              is_locked: false, 
              locked_by: undefined,
              locked_by_name: undefined,
              locked_at: undefined
            } 
          : page
      )
    );
  };
  
  const createUserAccount = async (params: { email: string; password: string; full_name: string; role: 'employee' | 'client' }) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    try {
      console.log('Creating user account:', params.email, params.role);
      
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.full_name,
            role: params.role
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Insert/Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: params.full_name,
            role: params.role,
            email: params.email
          });

        if (profileError) throw profileError;

        console.log('User account created successfully:', data.user.id);
        return { id: data.user.id };
      }
      
      return null;
    } catch (error) {
      console.error('Error creating user account:', error);
      throw error;
    }
  };

  // Load accessible project IDs and files on mount or user change
  useEffect(() => {
    if (user) {
      const initializeData = async () => {
        try {
          console.log('Initializing data for user:', user.id);
          const ids = await fetchAccessibleProjectIds();
          console.log('Accessible project IDs:', ids);
          setAccessibleProjectIds(ids);
          // Load all data when user is available
          const userProjects = await loadProjects();
          await refreshUsers();
          await loadStages();
          await loadFiles();
          await loadTasks(userProjects);
          await loadProjectOverviews(userProjects?.map(p => p.id));
          await loadGlobalComments(userProjects);
        } catch (error) {
          console.error('Error initializing data:', error);
        }
      };

      initializeData();
    }
  }, [user, fetchAccessibleProjectIds, loadProjects, refreshUsers, loadStages, loadFiles, loadTasks, loadGlobalComments]);

  return (
    <DataContext.Provider value={{
      projects,
      stages,
      commentTasks,
      globalComments,
      users,
      files,
      tasks,
      meetings,
      brochureProjects,
      brochurePages,
      pageComments,
      leads,
      downloadHistory,
      projectOverviews,
      createProject,
      updateProject,
      addCommentTask,
      addGlobalComment,
      updateCommentTaskStatus,
      updateGlobalComment,
      deleteGlobalComment,
      updateCommentTask,
      deleteCommentTask,
      updateStageApproval,
      uploadFile,
      uploadFileFromInput,
      uploadBrochureImage,
      updateStageProgress,
      scheduleMeeting,
      createTask,
      updateTaskStatus,
      updateTask,
      deleteTask,
      createBrochureProject,
      updateBrochureProject,
      deleteBrochurePage,
      saveBrochurePage,
      getBrochurePages,
      addPageComment,
      getPageComments,
      markCommentDone,
      downloadFile,
      downloadMultipleFiles,
      getDownloadHistory,
      updateFileMetadata,
      createLead,
      updateLead,
      deleteLead,
      // project overviews
      projectOverviews,
      getProjectOverview,
      saveProjectOverview,
      updateProjectOverview,
      deleteProjectOverview,
      loadProjectOverviews,
      approveBrochurePage,
      getBrochureProjectsForReview,
      lockBrochurePage,
      unlockBrochurePage,
      createUserAccount,
      refreshUsers,
      loadProjects,
      loadFiles,
      deleteFile,
      loadGlobalComments,
      refreshTasks
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
