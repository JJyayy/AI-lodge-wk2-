import { describe, it, expect, beforeEach } from 'vitest';
import { storageService, defaultCategories } from '../src/services/storage';
import { Task } from '../src/types';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads tasks from localStorage', () => {
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Review PRD specifications',
        description: 'Read all acceptance criteria',
        isCompleted: false,
        priority: 'P1',
        categoryId: 'work',
        dueDate: null,
        subtasks: [{ id: 'st-1', title: 'Check NFRs', isCompleted: true }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    storageService.saveTasksLocal(mockTasks);
    const loaded = storageService.loadTasksLocal();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('Review PRD specifications');
    expect(loaded[0].priority).toBe('P1');
  });

  it('validates and imports JSON backup correctly', () => {
    const validJson = JSON.stringify({
      _schemaVersion: 1,
      tasks: [
        {
          id: 'imported-1',
          title: 'Imported Task Title',
          description: 'Imported note',
          isCompleted: true,
          priority: 'P2',
          categoryId: 'study',
          dueDate: null,
          subtasks: [],
        },
      ],
      categories: defaultCategories,
    });

    const result = storageService.validateAndImport(validJson);
    expect(result.tasks).toHaveLength(1);
    expect(result.tasks[0].title).toBe('Imported Task Title');
    expect(result.tasks[0].priority).toBe('P2');
  });

  it('rejects invalid JSON import structure', () => {
    const invalidJson = JSON.stringify({
      tasks: [{ invalid: 'missing title' }],
    });

    expect(() => storageService.validateAndImport(invalidJson)).toThrow();
  });
});
