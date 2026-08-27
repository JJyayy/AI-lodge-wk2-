import React from 'react';
import { WifiOff, RefreshCw, KeyRound } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';

export const StatusBanner: React.FC = () => {
  const { isBackendOffline, isAuthExpired, refreshTasks } = useTasks();
  const { openAuthModal } = useAuth();

  if (isAuthExpired) {
    return (
      <div className="status-banner error" role="alert">
        <KeyRound size={16} />
        <span>Authentication session has expired.</span>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}
          onClick={() => openAuthModal('signin')}
        >
          Sign In
        </button>
      </div>
    );
  }

  if (isBackendOffline) {
    return (
      <div className="status-banner" role="status">
        <WifiOff size={16} />
        <span>Operating in offline mode. Tasks are saved locally in your browser.</span>
        <button
          type="button"
          className="btn-secondary"
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}
          onClick={refreshTasks}
        >
          <RefreshCw size={12} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return null;
};
