import React, { useState } from 'react';
import { Plus, Calendar, Flag, Folder } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { PriorityLevel } from '../types';

export const TaskInputForm: React.FC = () => {
  const { addTask, categories } = useTasks();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('P3');
  const [categoryId, setCategoryId] = useState('work');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await addTask({
      title: title.trim(),
      priority,
      categoryId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });

    setTitle('');
    setDueDate('');
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setTitle('');
      setDueDate('');
    }
  };

  return (
    <div className="task-input-container">
      <form onSubmit={handleSubmit}>
        <div className="task-input-row">
          <input
            type="text"
            className="task-title-input"
            placeholder="What do you need to accomplish? (Press Enter to add, Esc to clear)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={250}
            required
            aria-label="New task title"
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={!title.trim() || isSubmitting}
            aria-label="Add task"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>

        <div className="task-input-options">
          {/* Priority selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Flag size={14} color="var(--text-muted)" />
            <select
              className="select-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              aria-label="Select priority"
            >
              <option value="P1">🔴 P1 - Urgent</option>
              <option value="P2">🟠 P2 - High</option>
              <option value="P3">🔵 P3 - Medium</option>
              <option value="P4">⚪ P4 - Low</option>
            </select>
          </div>

          {/* Category selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Folder size={14} color="var(--text-muted)" />
            <select
              className="select-control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              aria-label="Select category"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due date picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} color="var(--text-muted)" />
            <input
              type="datetime-local"
              className="date-picker-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Select due date and time"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
