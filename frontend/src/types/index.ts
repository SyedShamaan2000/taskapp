/**
 * TaskTrackr — TypeScript Domain & API Definitions
 * Task API is status-only (no completed boolean).
 */

export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  onlineStatus?: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  sort?: string;
  status?: TaskStatus;
  priority?: TaskPriority | '';
  search?: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  message?: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface VerifyResponse {
  success: boolean;
  message: string;
}

export interface TasksResponse {
  success: boolean;
  tasks: Task[];
  pagination: TaskPagination;
}

export interface CsrfResponse {
  csrfToken: string;
}
