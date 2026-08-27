import { Task, Category, TaskFilterState } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback to text
      }
      throw new ApiError(errorMessage, response.status);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or offline error
    throw new ApiError(
      error.message || 'Unable to connect to backend server. Operating in offline mode.',
      0
    );
  }
}

export const taskApi = {
  async getTasks(token: string | null, filters?: Partial<TaskFilterState>): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.searchQuery) params.append('search', filters.searchQuery);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.categoryId) params.append('category_id', filters.categoryId);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.sortBy) params.append('sort_by', filters.sortBy);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return request<Task[]>(`/api/v1/tasks${queryStr}`, token, { method: 'GET' });
  },

  async createTask(
    token: string | null,
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Task> {
    return request<Task>('/api/v1/tasks', token, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(
    token: string | null,
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task> {
    return request<Task>(`/api/v1/tasks/${taskId}`, token, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(token: string | null, taskId: string): Promise<void> {
    return request<void>(`/api/v1/tasks/${taskId}`, token, {
      method: 'DELETE',
    });
  },

  async bulkDelete(token: string | null, ids: string[]): Promise<{ deleted: number }> {
    return request<{ deleted: number }>('/api/v1/tasks/bulk-delete', token, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  async bulkComplete(
    token: string | null,
    ids: string[],
    isCompleted: boolean
  ): Promise<{ updated: number }> {
    return request<{ updated: number }>('/api/v1/tasks/bulk-complete', token, {
      method: 'POST',
      body: JSON.stringify({ ids, isCompleted }),
    });
  },

  async getCategories(token: string | null): Promise<Category[]> {
    return request<Category[]>('/api/v1/categories', token, { method: 'GET' });
  },

  async createCategory(
    token: string | null,
    category: { id: string; name: string; colorHex: string; icon?: string }
  ): Promise<Category> {
    return request<Category>('/api/v1/categories', token, {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  async checkHealth(): Promise<{ status: string }> {
    return request<{ status: string }>('/api/v1/health', null, { method: 'GET' });
  },
};
