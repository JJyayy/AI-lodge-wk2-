import { Task, Category } from '../types';

const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks_v1',
  CATEGORIES: 'taskflow_categories_v1',
  THEME: 'taskflow_theme_preference',
};

export const defaultCategories: Category[] = [
  { id: 'work', name: 'Work', colorHex: '#6366F1', icon: 'Briefcase' },
  { id: 'study', name: 'Study', colorHex: '#EC4899', icon: 'GraduationCap' },
  { id: 'personal', name: 'Personal', colorHex: '#10B981', icon: 'User' },
  { id: 'health', name: 'Health', colorHex: '#F59E0B', icon: 'Heart' },
];

export const storageService = {
  loadTasksLocal(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load tasks from localStorage:', e);
      return [];
    }
  },

  saveTasksLocal(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }
  },

  loadCategoriesLocal(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) return defaultCategories;
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultCategories;
    } catch (e) {
      console.error('Failed to load categories from localStorage:', e);
      return defaultCategories;
    }
  },

  saveCategoriesLocal(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage:', e);
    }
  },

  exportToJson(tasks: Task[], categories: Category[]): void {
    const backupData = {
      _schemaVersion: 1,
      appName: 'TaskFlow',
      exportedAt: new Date().toISOString(),
      tasks,
      categories,
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  validateAndImport(jsonString: string): { tasks: Task[]; categories: Category[] } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON format: root must be an object');
      }

      const tasksRaw = data.tasks;
      if (!Array.isArray(tasksRaw)) {
        throw new Error('Invalid format: "tasks" array is missing or invalid');
      }

      // Validate each task
      const validatedTasks: Task[] = tasksRaw.map((t: any, index: number) => {
        if (!t.title || typeof t.title !== 'string') {
          throw new Error(`Task #${index + 1} has an invalid or missing title`);
        }
        return {
          id: t.id || `imported-${Date.now()}-${index}`,
          userId: t.userId,
          title: String(t.title).slice(0, 250),
          description: t.description ? String(t.description) : '',
          isCompleted: Boolean(t.isCompleted),
          priority: ['P1', 'P2', 'P3', 'P4'].includes(t.priority) ? t.priority : 'P4',
          categoryId: t.categoryId || 'work',
          dueDate: t.dueDate || null,
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString(),
          subtasks: Array.isArray(t.subtasks)
            ? t.subtasks.map((st: any, sIdx: number) => ({
                id: st.id || `st-${sIdx}`,
                title: String(st.title || 'Untitled subtask'),
                isCompleted: Boolean(st.isCompleted),
              }))
            : [],
        };
      });

      const categoriesRaw = data.categories;
      const validatedCategories: Category[] = Array.isArray(categoriesRaw)
        ? categoriesRaw.map((c: any) => ({
            id: String(c.id || 'custom').toLowerCase(),
            name: String(c.name || 'Category'),
            colorHex: String(c.colorHex || '#6366F1'),
            icon: c.icon ? String(c.icon) : undefined,
          }))
        : defaultCategories;

      return { tasks: validatedTasks, categories: validatedCategories };
    } catch (e: any) {
      throw new Error(`Import validation failed: ${e.message}`);
    }
  },

  getThemePreference(): 'light' | 'dark' {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },

  setThemePreference(theme: 'light' | 'dark'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },
};
