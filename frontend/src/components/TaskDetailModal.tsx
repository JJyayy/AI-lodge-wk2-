import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { Task, SubTask, PriorityLevel } from '../types';
import { useTasks } from '../context/TaskContext';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const { updateTask, categories } = useTasks();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState<PriorityLevel>(task.priority);
  const [categoryId, setCategoryId] = useState(task.categoryId);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : ''
  );
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSt: SubTask = {
      id: `st-${Date.now()}-${Math.random()}`,
      title: newSubtaskTitle.trim(),
      isCompleted: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === id ? { ...st, isCompleted: !st.isCompleted } : st
      )
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim() || isSaving) return;

    setIsSaving(true);
    await updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      categoryId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      subtasks,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            Edit Task Details
          </h2>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Title input */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-edit-title">
            Task Title *
          </label>
          <input
            id="task-edit-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={250}
            required
          />
        </div>

        {/* Priority, Category, Due Date Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="select-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            >
              <option value="P1">🔴 P1 - Urgent</option>
              <option value="P2">🟠 P2 - High</option>
              <option value="P3">🔵 P3 - Medium</option>
              <option value="P4">⚪ P4 - Low</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="select-control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date & Time</label>
            <input
              type="datetime-local"
              className="date-picker-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Description / Notes */}
        <div className="form-group">
          <label className="form-label" htmlFor="task-edit-desc">
            Description & Notes
          </label>
          <textarea
            id="task-edit-desc"
            className="form-textarea"
            placeholder="Add detailed markdown notes, links, or instructions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={5000}
          />
        </div>

        {/* Subtask Checklist Manager */}
        <div className="form-group">
          <label className="form-label">
            Subtask Checklist ({subtasks.filter((s) => s.isCompleted).length}/{subtasks.length})
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
            {subtasks.map((st) => (
              <div
                key={st.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-primary)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
                  <button
                    type="button"
                    className={`custom-checkbox ${st.isCompleted ? 'checked' : ''}`}
                    style={{ width: '18px', height: '18px' }}
                    onClick={() => handleToggleSubtask(st.id)}
                    role="checkbox"
                    aria-checked={st.isCompleted}
                  >
                    {st.isCompleted && <Check size={11} strokeWidth={3} />}
                  </button>
                  <span
                    style={{
                      textDecoration: st.isCompleted ? 'line-through' : 'none',
                      color: st.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {st.title}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-icon"
                  style={{ width: '26px', height: '26px', border: 'none', background: 'transparent' }}
                  onClick={() => handleDeleteSubtask(st.id)}
                  title="Remove subtask"
                >
                  <Trash2 size={13} color="var(--color-danger)" />
                </button>
              </div>
            ))}

            {/* Add subtask input */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.88rem' }}
                placeholder="Add new subtask item..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask(e);
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                onClick={handleAddSubtask}
              >
                <Plus size={15} />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!title.trim() || isSaving}
            onClick={handleSave}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
