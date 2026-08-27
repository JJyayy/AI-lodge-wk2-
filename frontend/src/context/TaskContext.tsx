import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { taskApi, ApiError } from '../services/api';
import { storageService, defaultCategories } from '../services/storage';
import {
  Task,
  Category,
  TaskFilterState,
  TaskMetrics,
  Toast,
  PriorityLevel,
} from '../types';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  categories: Category[];
  filterState: TaskFilterState;
  metrics: TaskMetrics;
  loading: boolean;
  isBackendOffline: boolean;
  isAuthExpired: boolean;
  activeDetailTask: Task | null;
  toasts: Toast[];
  setFilterState: (updates: Partial<TaskFilterState>) => void;
  openDetailModal: (task: Task) => void;
  closeDetailModal: () => void;
  addTask: (taskData: {
    title: string;
    description?: string;
    priority?: PriorityLevel;
    categoryId?: string;
    dueDate?: string | null;
  }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  bulkComplete: (ids: string[], isCompleted: boolean) => Promise<void>;
  addCategory: (category: { id: string; name: string; colorHex: string; icon?: string }) => Promise<void>;
  exportData: () => void;
  importData: (jsonString: string) => Promise<{ success: boolean; message: string }>;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBackendOffline, setIsBackendOffline] = useState<boolean>(false);
  const [isAuthExpired, setIsAuthExpired] = useState<boolean>(false);
  const [activeDetailTask, setActiveDetailTask] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [filterState, setFilterStateInternal] = useState<TaskFilterState>({
    searchQuery: '',
    status: 'ALL',
    categoryId: null,
    priority: null,
    sortBy: 'CREATED_DESC',
  });

  const addToast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { ...toastData, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toastData.duration || (toastData.type === 'undo' ? 6000 : 4000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setFilterState = (updates: Partial<TaskFilterState>) => {
    setFilterStateInternal((prev) => ({ ...prev, ...updates }));
  };

  // Fetch tasks and categories
  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setIsBackendOffline(false);
    setIsAuthExpired(false);

    if (token) {
      try {
        const [remoteTasks, remoteCats] = await Promise.all([
          taskApi.getTasks(token),
          taskApi.getCategories(token),
        ]);
        setTasks(remoteTasks);
        setCategories(remoteCats.length > 0 ? remoteCats : defaultCategories);
        // Sync local cache
        storageService.saveTasksLocal(remoteTasks);
        storageService.saveCategoriesLocal(remoteCats);
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 401) {
          setIsAuthExpired(true);
          addToast({
            type: 'error',
            message: 'Your session has expired. Please sign in again.',
          });
        } else {
          setIsBackendOffline(true);
          // Fallback to local storage
          const localTasks = storageService.loadTasksLocal();
          const localCats = storageService.loadCategoriesLocal();
          setTasks(localTasks);
          setCategories(localCats);
        }
      }
    } else {
      // Unauthenticated / Local storage mode
      const localTasks = storageService.loadTasksLocal();
      const localCats = storageService.loadCategoriesLocal();
      setTasks(localTasks);
      setCategories(localCats);
    }
    setLoading(false);
  }, [token, addToast]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  // Compute filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Status filter
    if (filterState.status === 'ACTIVE') {
      result = result.filter((t) => !t.isCompleted);
    } else if (filterState.status === 'COMPLETED') {
      result = result.filter((t) => t.isCompleted);
    }

    // Category filter
    if (filterState.categoryId) {
      result = result.filter((t) => t.categoryId === filterState.categoryId);
    }

    // Priority filter
    if (filterState.priority) {
      result = result.filter((t) => t.priority === filterState.priority);
    }

    // Search query filter
    if (filterState.searchQuery.trim()) {
      const q = filterState.searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (filterState.sortBy) {
        case 'DUE_DATE_ASC':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'DUE_DATE_DESC':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'PRIORITY_DESC':
          const priorityOrder: Record<PriorityLevel, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'TITLE_ASC':
          return a.title.localeCompare(b.title);
        case 'CREATED_DESC':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [tasks, filterState]);

  // Compute productivity metrics
  const metrics = useMemo<TaskMetrics>(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const incomplete = total - completed;
    const now = new Date().getTime();
    const overdue = tasks.filter(
      (t) => !t.isCompleted && t.dueDate && new Date(t.dueDate).getTime() < now
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, incomplete, overdue, completionRate };
  }, [tasks]);

  // Add Task
  const addTask = async (taskData: {
    title: string;
    description?: string;
    priority?: PriorityLevel;
    categoryId?: string;
    dueDate?: string | null;
  }) => {
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
      id: tempId,
      userId: user?.id,
      title: taskData.title.trim(),
      description: taskData.description?.trim() || '',
      isCompleted: false,
      priority: taskData.priority || 'P4',
      categoryId: taskData.categoryId || 'work',
      dueDate: taskData.dueDate || null,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic state update
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    storageService.saveTasksLocal(updatedTasks);

    if (token) {
      try {
        const created = await taskApi.createTask(token, {
          title: newTask.title,
          description: newTask.description,
          isCompleted: false,
          priority: newTask.priority,
          categoryId: newTask.categoryId,
          dueDate: newTask.dueDate,
          subtasks: [],
        });
        // Replace temp ID with confirmed backend ID
        setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
        storageService.saveTasksLocal(
          updatedTasks.map((t) => (t.id === tempId ? created : t))
        );
      } catch (err: any) {
        console.warn('Backend create failed, saved locally:', err.message);
        addToast({
          type: 'info',
          message: 'Saved to local storage (Backend unavailable).',
        });
      }
    } else {
      addToast({
        type: 'success',
        message: 'Task added successfully to local storage.',
      });
    }
  };

  // Update Task
  const updateTask = async (id: string, updates: Partial<Task>) => {
    const nowIso = new Date().toISOString();

    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: nowIso } : t
    );
    setTasks(updatedTasks);
    storageService.saveTasksLocal(updatedTasks);

    if (activeDetailTask && activeDetailTask.id === id) {
      setActiveDetailTask((prev) => (prev ? { ...prev, ...updates, updatedAt: nowIso } : null));
    }

    if (token && !id.startsWith('temp-')) {
      try {
        const remoteUpdated = await taskApi.updateTask(token, id, updates);
        setTasks((prev) => prev.map((t) => (t.id === id ? remoteUpdated : t)));
      } catch (err: any) {
        console.warn('Remote update failed:', err.message);
      }
    }
  };

  // Toggle Task Completion with optional celebration
  const toggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const nextCompleted = !task.isCompleted;
    await updateTask(id, { isCompleted: nextCompleted });

    if (nextCompleted) {
      const willBeAllDone =
        tasks.length > 0 &&
        tasks.every((t) => (t.id === id ? true : t.isCompleted));

      if (willBeAllDone) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        addToast({
          type: 'success',
          message: '🎉 Fantastic job! All tasks completed!',
        });
      }
    }
  };

  // Delete Task with Undo option
  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;

    const previousTasks = [...tasks];
    const updatedTasks = tasks.filter((t) => t.id !== id);
    setTasks(updatedTasks);
    storageService.saveTasksLocal(updatedTasks);

    if (activeDetailTask?.id === id) {
      setActiveDetailTask(null);
    }

    let undone = false;
    addToast({
      type: 'undo',
      message: `Deleted "${taskToDelete.title.slice(0, 30)}${
        taskToDelete.title.length > 30 ? '...' : ''
      }"`,
      onUndo: () => {
        undone = true;
        setTasks(previousTasks);
        storageService.saveTasksLocal(previousTasks);
      },
    });

    // Delayed backend deletion
    setTimeout(async () => {
      if (!undone && token && !id.startsWith('temp-')) {
        try {
          await taskApi.deleteTask(token, id);
        } catch (err) {
          console.error('Remote deletion failed:', err);
        }
      }
    }, 6000);
  };

  // Bulk Delete
  const bulkDelete = async (ids: string[]) => {
    if (ids.length === 0) return;
    const updatedTasks = tasks.filter((t) => !ids.includes(t.id));
    setTasks(updatedTasks);
    storageService.saveTasksLocal(updatedTasks);

    if (token) {
      const realIds = ids.filter((id) => !id.startsWith('temp-'));
      if (realIds.length > 0) {
        try {
          await taskApi.bulkDelete(token, realIds);
        } catch (err) {
          console.error('Remote bulk delete failed:', err);
        }
      }
    }
    addToast({
      type: 'info',
      message: `Cleared ${ids.length} completed task${ids.length > 1 ? 's' : ''}.`,
    });
  };

  // Bulk Complete
  const bulkComplete = async (ids: string[], isCompleted: boolean) => {
    if (ids.length === 0) return;
    const updatedTasks = tasks.map((t) =>
      ids.includes(t.id) ? { ...t, isCompleted, updatedAt: new Date().toISOString() } : t
    );
    setTasks(updatedTasks);
    storageService.saveTasksLocal(updatedTasks);

    if (isCompleted && updatedTasks.length > 0) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    if (token) {
      const realIds = ids.filter((id) => !id.startsWith('temp-'));
      if (realIds.length > 0) {
        try {
          await taskApi.bulkComplete(token, realIds, isCompleted);
        } catch (err) {
          console.error('Remote bulk complete failed:', err);
        }
      }
    }
  };

  // Add Category
  const addCategory = async (categoryData: {
    id: string;
    name: string;
    colorHex: string;
    icon?: string;
  }) => {
    const newCat: Category = {
      id: categoryData.id.toLowerCase().replace(/\s+/g, '-'),
      name: categoryData.name,
      colorHex: categoryData.colorHex,
      icon: categoryData.icon,
    };

    const updatedCategories = [...categories, newCat];
    setCategories(updatedCategories);
    storageService.saveCategoriesLocal(updatedCategories);

    if (token) {
      try {
        await taskApi.createCategory(token, newCat);
      } catch (err) {
        console.error('Remote category creation failed:', err);
      }
    }

    addToast({
      type: 'success',
      message: `Category "${newCat.name}" created!`,
    });
  };

  // Export JSON
  const exportData = () => {
    storageService.exportToJson(tasks, categories);
    addToast({
      type: 'success',
      message: 'Tasks exported successfully as JSON.',
    });
  };

  // Import JSON
  const importData = async (jsonString: string) => {
    try {
      const imported = storageService.validateAndImport(jsonString);
      setTasks(imported.tasks);
      setCategories(imported.categories);
      storageService.saveTasksLocal(imported.tasks);
      storageService.saveCategoriesLocal(imported.categories);

      addToast({
        type: 'success',
        message: `Successfully imported ${imported.tasks.length} tasks!`,
      });
      return { success: true, message: 'Import successful' };
    } catch (e: any) {
      addToast({
        type: 'error',
        message: e.message || 'Import validation failed',
      });
      return { success: false, message: e.message };
    }
  };

  const openDetailModal = (task: Task) => {
    setActiveDetailTask(task);
  };

  const closeDetailModal = () => {
    setActiveDetailTask(null);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        categories,
        filterState,
        metrics,
        loading,
        isBackendOffline,
        isAuthExpired,
        activeDetailTask,
        toasts,
        setFilterState,
        openDetailModal,
        closeDetailModal,
        addTask,
        updateTask,
        toggleComplete,
        deleteTask,
        bulkDelete,
        bulkComplete,
        addCategory,
        exportData,
        importData,
        addToast,
        dismissToast,
        refreshTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
