import React, { useState } from 'react';
import {
  Layers,
  Flag,
  Plus,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { PriorityLevel } from '../types';

export const Sidebar: React.FC = () => {
  const {
    tasks,
    categories,
    filterState,
    setFilterState,
    addCategory,
  } = useTasks();

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8B5CF6');

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    await addCategory({
      id: newCatName.trim().toLowerCase().replace(/\s+/g, '-'),
      name: newCatName.trim(),
      colorHex: newCatColor,
    });

    setNewCatName('');
    setIsAddingCategory(false);
  };

  const getPriorityCount = (p: PriorityLevel) => {
    return tasks.filter((t) => !t.isCompleted && t.priority === p).length;
  };

  const getCategoryCount = (catId: string) => {
    return tasks.filter((t) => !t.isCompleted && t.categoryId === catId).length;
  };

  return (
    <aside className="sidebar-panel" aria-label="Task categories and priority filters">
      {/* Views */}
      <div>
        <div className="sidebar-section-title">Views</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <button
            type="button"
            className={`nav-item-btn ${
              !filterState.categoryId && !filterState.priority ? 'active' : ''
            }`}
            onClick={() => setFilterState({ categoryId: null, priority: null })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Layers size={16} />
              <span>All Tasks</span>
            </div>
            <span className="count-pill">
              {tasks.filter((t) => !t.isCompleted).length}
            </span>
          </button>
        </div>
      </div>

      {/* Priority Matrix */}
      <div>
        <div className="sidebar-section-title">Priority Tiers</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {(
            [
              { level: 'P1' as PriorityLevel, label: 'P1 Urgent', color: 'var(--priority-p1)' },
              { level: 'P2' as PriorityLevel, label: 'P2 High', color: 'var(--priority-p2)' },
              { level: 'P3' as PriorityLevel, label: 'P3 Medium', color: 'var(--priority-p3)' },
              { level: 'P4' as PriorityLevel, label: 'P4 Low', color: 'var(--priority-p4)' },
            ]
          ).map(({ level, label, color }) => {
            const count = getPriorityCount(level);
            return (
              <button
                key={level}
                type="button"
                className={`nav-item-btn ${
                  filterState.priority === level ? 'active' : ''
                }`}
                onClick={() =>
                  setFilterState({
                    priority: filterState.priority === level ? null : level,
                    categoryId: null,
                  })
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Flag size={15} color={color} fill={color} />
                  <span>{label}</span>
                </div>
                <span className="count-pill">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.6rem',
          }}
        >
          <div className="sidebar-section-title" style={{ marginBottom: 0 }}>
            Categories
          </div>
          <button
            type="button"
            className="btn-icon"
            style={{ width: '22px', height: '22px', border: 'none', background: 'transparent' }}
            onClick={() => setIsAddingCategory(!isAddingCategory)}
            title="Add Custom Category"
          >
            <Plus size={14} />
          </button>
        </div>

        {isAddingCategory && (
          <form
            onSubmit={handleAddCategorySubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              background: 'var(--bg-primary)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '0.75rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <input
              type="text"
              className="form-input"
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}
              placeholder="Category name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
              autoFocus
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ width: '28px', height: '28px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                title="Select color"
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              >
                Save
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                onClick={() => setIsAddingCategory(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {categories.map((cat) => {
            const count = getCategoryCount(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                className={`nav-item-btn ${
                  filterState.categoryId === cat.id ? 'active' : ''
                }`}
                onClick={() =>
                  setFilterState({
                    categoryId: filterState.categoryId === cat.id ? null : cat.id,
                    priority: null,
                  })
                }
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    className="category-dot"
                    style={{ backgroundColor: cat.colorHex }}
                  />
                  <span>{cat.name}</span>
                </div>
                <span className="count-pill">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
