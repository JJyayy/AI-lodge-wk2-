import React from 'react';
import { CheckCircle2, AlertCircle, Info, Undo2, X } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useTasks();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-item"
          role="alert"
          style={{
            borderLeft:
              t.type === 'error'
                ? '4px solid var(--color-danger)'
                : t.type === 'success'
                ? '4px solid var(--color-success)'
                : t.type === 'undo'
                ? '4px solid var(--color-accent)'
                : '4px solid var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {t.type === 'success' && <CheckCircle2 size={18} color="var(--color-success)" />}
            {t.type === 'error' && <AlertCircle size={18} color="var(--color-danger)" />}
            {t.type === 'info' && <Info size={18} color="var(--text-muted)" />}
            {t.type === 'undo' && <Info size={18} color="var(--color-accent)" />}
            <span>{t.message}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {t.type === 'undo' && t.onUndo && (
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                onClick={() => {
                  t.onUndo?.();
                  dismissToast(t.id);
                }}
              >
                <Undo2 size={13} />
                <span>Undo</span>
              </button>
            )}

            <button
              type="button"
              className="btn-icon"
              style={{ width: '24px', height: '24px', border: 'none', background: 'transparent' }}
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
