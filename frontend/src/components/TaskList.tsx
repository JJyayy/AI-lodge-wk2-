import React from 'react';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { useTasks } from '../context/TaskContext';

export const TaskList: React.FC = () => {
  const { filteredTasks, tasks, loading, filterState } = useTasks();

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="task-card"
            style={{ minHeight: '80px', opacity: 0.5, animation: 'pulse 1.5s infinite' }}
          >
            <div style={{ height: '18px', width: '60%', background: 'var(--bg-surface-hover)', borderRadius: '4px' }} />
            <div style={{ height: '14px', width: '30%', background: 'var(--bg-surface-hover)', borderRadius: '4px', marginTop: '0.5rem' }} />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState type="no-tasks" />;
  }

  if (filteredTasks.length === 0) {
    if (filterState.searchQuery) {
      return <EmptyState type="no-search-results" query={filterState.searchQuery} />;
    }
    if (filterState.status === 'COMPLETED') {
      return <EmptyState type="no-completed" />;
    }
    if (filterState.status === 'ACTIVE') {
      return <EmptyState type="all-completed" />;
    }
    return <EmptyState type="no-filtered-tasks" />;
  }

  return (
    <div className="task-list-container" role="list">
      {filteredTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};
