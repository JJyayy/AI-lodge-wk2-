import React from 'react';
import { ArrowUpDown, CheckCheck, Trash2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { FilterStatus, SortOption } from '../types';

export const FilterToolbar: React.FC = () => {
  const {
    tasks,
    filterState,
    setFilterState,
    bulkComplete,
    bulkDelete,
  } = useTasks();

  const completedTasks = tasks.filter((t) => t.isCompleted);
  const incompleteTasks = tasks.filter((t) => !t.isCompleted);

  const handleMarkAllCompleted = () => {
    const ids = incompleteTasks.map((t) => t.id);
    if (ids.length > 0) {
      bulkComplete(ids, true);
    }
  };

  const handleClearCompleted = () => {
    const ids = completedTasks.map((t) => t.id);
    if (ids.length > 0) {
      bulkDelete(ids);
    }
  };

  return (
    <div className="filter-toolbar" role="toolbar" aria-label="Task filters and sorting">
      {/* Status Tabs */}
      <div className="filter-tabs" role="tablist">
        {(['ALL', 'ACTIVE', 'COMPLETED'] as FilterStatus[]).map((st) => (
          <button
            key={st}
            role="tab"
            aria-selected={filterState.status === st}
            className={`filter-tab-btn ${filterState.status === st ? 'active' : ''}`}
            onClick={() => setFilterState({ status: st })}
          >
            {st === 'ALL' && `All (${tasks.length})`}
            {st === 'ACTIVE' && `Active (${incompleteTasks.length})`}
            {st === 'COMPLETED' && `Completed (${completedTasks.length})`}
          </button>
        ))}
      </div>

      {/* Sort & Bulk Actions */}
      <div className="toolbar-right-actions">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ArrowUpDown size={14} color="var(--text-muted)" />
          <select
            className="select-control"
            value={filterState.sortBy}
            onChange={(e) => setFilterState({ sortBy: e.target.value as SortOption })}
            aria-label="Sort tasks by"
          >
            <option value="CREATED_DESC">Newest First</option>
            <option value="DUE_DATE_ASC">Due Date: Earliest First</option>
            <option value="DUE_DATE_DESC">Due Date: Latest First</option>
            <option value="PRIORITY_DESC">Priority: P1 to P4</option>
            <option value="TITLE_ASC">Alphabetical (A - Z)</option>
          </select>
        </div>

        {incompleteTasks.length > 0 && (
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
            onClick={handleMarkAllCompleted}
            title="Mark all active tasks as completed"
          >
            <CheckCheck size={14} color="var(--color-success)" />
            <span>Mark All Done</span>
          </button>
        )}

        {completedTasks.length > 0 && (
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
            onClick={handleClearCompleted}
            title="Delete all completed tasks"
          >
            <Trash2 size={14} color="var(--color-danger)" />
            <span>Clear Completed</span>
          </button>
        )}
      </div>
    </div>
  );
};
