export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  colorHex: string;
  icon?: string;
  userId?: string | null;
  createdAt?: string;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: PriorityLevel;
  categoryId: string;
  dueDate: string | null; // ISO 8601 string or null
  createdAt: string;     // ISO 8601 string
  updatedAt: string;     // ISO 8601 string
  subtasks: SubTask[];
}

export type FilterStatus = 'ALL' | 'ACTIVE' | 'COMPLETED';

export type SortOption =
  | 'DUE_DATE_ASC'
  | 'DUE_DATE_DESC'
  | 'PRIORITY_DESC'
  | 'CREATED_DESC'
  | 'TITLE_ASC';

export interface TaskFilterState {
  searchQuery: string;
  status: FilterStatus;
  categoryId: string | null;
  priority: PriorityLevel | null;
  sortBy: SortOption;
}

export interface TaskMetrics {
  total: number;
  completed: number;
  incomplete: number;
  overdue: number;
  completionRate: number; // 0 to 100
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'undo';
  message: string;
  onUndo?: () => void;
  duration?: number;
}

export interface UserProfile {
  id: string;
  email: string;
}
