import React from 'react';
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const StatsOverview: React.FC = () => {
  const { metrics } = useTasks();

  return (
    <section className="stats-overview-card" aria-label="Task progress and metrics">
      <div className="stats-header-row">
        <div>
          <h2 className="stats-title">Productivity Progress</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {metrics.completed} of {metrics.total} tasks completed
          </span>
        </div>
        <span className="stats-rate-badge">{metrics.completionRate}%</span>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={metrics.completionRate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Task completion percentage"
      >
        <div
          className="progress-bar-fill"
          style={{ width: `${metrics.completionRate}%` }}
        />
      </div>

      <div className="stats-metrics-grid">
        <div className="stat-item">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}
          >
            <ListTodo size={20} />
          </div>
          <div>
            <div className="stat-val">{metrics.total}</div>
            <div className="stat-lbl">Total Tasks</div>
          </div>
        </div>

        <div className="stat-item">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="stat-val">{metrics.completed}</div>
            <div className="stat-lbl">Completed</div>
          </div>
        </div>

        <div className="stat-item">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'var(--priority-p3-bg)', color: 'var(--priority-p3)' }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div className="stat-val">{metrics.incomplete}</div>
            <div className="stat-lbl">Incomplete</div>
          </div>
        </div>

        <div className="stat-item">
          <div
            className="stat-icon-wrapper"
            style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}
          >
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="stat-val">{metrics.overdue}</div>
            <div className="stat-lbl">Overdue</div>
          </div>
        </div>
      </div>
    </section>
  );
};
