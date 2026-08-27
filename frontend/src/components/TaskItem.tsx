import React, { useState } from 'react';
import {
  Check,
  Calendar,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  ListChecks,
} from 'lucide-react';
import { Task, SubTask } from '../types';
import { useTasks } from '../context/TaskContext';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { toggleComplete, deleteTask, updateTask, openDetailModal, categories } = useTasks();
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);

  const category = categories.find((c) => c.id === task.categoryId);

  const completedSubtasks = task.subtasks.filter((st) => st.isCompleted).length;
  const totalSubtasks = task.subtasks.length;

  const isOverdue =
    !task.isCompleted &&
    task.dueDate &&
    new Date(task.dueDate).getTime() < new Date().getTime();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const handleToggleSubtask = async (subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSubtasks: SubTask[] = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    await updateTask(task.id, { subtasks: updatedSubtasks });
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'P1': return 'badge-p1';
      case 'P2': return 'badge-p2';
      case 'P3': return 'badge-p3';
      case 'P4':
      default: return 'badge-p4';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'P1': return 'P1 Urgent';
      case 'P2': return 'P2 High';
      case 'P3': return 'P3 Medium';
      case 'P4':
      default: return 'P4 Low';
    }
  };

  return (
    <article
      className={`task-card ${task.isCompleted ? 'completed' : ''}`}
      aria-label={`Task: ${task.title}`}
    >
      <div className="task-card-main-row">
        {/* Checkbox */}
        <button
          type="button"
          className={`custom-checkbox ${task.isCompleted ? 'checked' : ''}`}
          onClick={() => toggleComplete(task.id)}
          aria-checked={task.isCompleted}
          role="checkbox"
          aria-label={task.isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}
        >
          {task.isCompleted && <Check size={14} strokeWidth={3} />}
        </button>

        {/* Content */}
        <div className="task-content-area" onClick={() => openDetailModal(task)} style={{ cursor: 'pointer' }}>
          <h3 className={`task-title-text ${task.isCompleted ? 'completed' : ''}`}>
            {task.title}
          </h3>

          {task.description && (
            <p className="task-description-preview">{task.description}</p>
          )}

          {/* Badges */}
          <div className="task-meta-badges">
            {/* Priority */}
            <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </span>

            {/* Category */}
            {category && (
              <span
                className="badge badge-category"
                style={{
                  borderLeft: `3px solid ${category.colorHex}`,
                }}
              >
                {category.name}
              </span>
            )}

            {/* Due Date */}
            {formattedDueDate && (
              <span className={`badge badge-due-date ${isOverdue ? 'overdue' : ''}`}>
                <Calendar size={12} />
                <span>{formattedDueDate} {isOverdue ? '(Overdue)' : ''}</span>
              </span>
            )}

            {/* Subtasks Count Badge */}
            {totalSubtasks > 0 && (
              <button
                type="button"
                className="badge badge-subtasks"
                style={{ border: 'none', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSubtasksExpanded(!subtasksExpanded);
                }}
              >
                <ListChecks size={12} />
                <span>{completedSubtasks}/{totalSubtasks} Subtasks</span>
                {subtasksExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="task-card-actions">
          <button
            type="button"
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={() => openDetailModal(task)}
            title="Edit task details"
            aria-label="Edit task details"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="btn-icon"
            style={{ width: '32px', height: '32px', color: 'var(--color-danger)' }}
            onClick={() => deleteTask(task.id)}
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Subtasks Expandable Checklist */}
      {subtasksExpanded && totalSubtasks > 0 && (
        <div className="subtasks-container">
          {task.subtasks.map((st) => (
            <div
              key={st.id}
              className={`subtask-item-row ${st.isCompleted ? 'completed' : ''}`}
            >
              <button
                type="button"
                className={`custom-checkbox ${st.isCompleted ? 'checked' : ''}`}
                style={{ width: '18px', height: '18px' }}
                onClick={(e) => handleToggleSubtask(st.id, e)}
                role="checkbox"
                aria-checked={st.isCompleted}
                aria-label={`Toggle subtask: ${st.title}`}
              >
                {st.isCompleted && <Check size={11} strokeWidth={3} />}
              </button>
              <span>{st.title}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};
