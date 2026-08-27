import React from 'react';
import { CheckCircle2, ListFilter, SearchX, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-tasks' | 'no-search-results' | 'no-completed' | 'all-completed' | 'no-filtered-tasks';
  query?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, query }) => {
  switch (type) {
    case 'no-tasks':
      return (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <Sparkles size={28} />
          </div>
          <h3 className="empty-state-title">No tasks yet!</h3>
          <p className="empty-state-subtitle">
            Capture your first to-do item above to boost your productivity and stay organized.
          </p>
        </div>
      );

    case 'all-completed':
      return (
        <div className="empty-state-box">
          <div
            className="empty-state-icon"
            style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
          >
            <CheckCircle2 size={28} />
          </div>
          <h3 className="empty-state-title">You're all caught up!</h3>
          <p className="empty-state-subtitle">
            All your active tasks are marked as complete. Enjoy your free time or add a new goal.
          </p>
        </div>
      );

    case 'no-search-results':
      return (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <SearchX size={28} />
          </div>
          <h3 className="empty-state-title">No tasks found</h3>
          <p className="empty-state-subtitle">
            No tasks match your search query "{query}". Try checking for typos or clear the search.
          </p>
        </div>
      );

    case 'no-completed':
      return (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <ListFilter size={28} />
          </div>
          <h3 className="empty-state-title">No completed tasks yet</h3>
          <p className="empty-state-subtitle">
            Finish tasks from the Active tab to see your accomplishments listed here.
          </p>
        </div>
      );

    case 'no-filtered-tasks':
    default:
      return (
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <ListFilter size={28} />
          </div>
          <h3 className="empty-state-title">No tasks matching current filter</h3>
          <p className="empty-state-subtitle">
            Try adjusting your priority, category, or status filters to view other tasks.
          </p>
        </div>
      );
  }
};
