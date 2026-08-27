import React, { useState } from 'react';
import { X, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    signIn,
    signUp,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    if (authModalMode === 'signin') {
      const res = await signIn(email, password);
      if (res.error) {
        setErrorMsg(res.error);
      }
    } else {
      const res = await signUp(email, password);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.message) {
        setSuccessMsg(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="modal-overlay"
      onClick={closeAuthModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="modal-content"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="auth-modal-title" className="modal-title">
            {authModalMode === 'signin' ? 'Sign In to TaskFlow' : 'Create an Account'}
          </h2>
          <button
            type="button"
            className="btn-icon"
            onClick={closeAuthModal}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="filter-tabs" style={{ width: '100%', display: 'flex' }}>
          <button
            type="button"
            className={`filter-tab-btn ${authModalMode === 'signin' ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center' }}
            onClick={() => {
              setErrorMsg(null);
              setSuccessMsg(null);
              openAuthModal('signin');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${authModalMode === 'signup' ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center' }}
            onClick={() => {
              setErrorMsg(null);
              setSuccessMsg(null);
              openAuthModal('signup');
            }}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '0.75rem',
              background: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address
            </label>
            <div className="search-input-wrapper">
              <Mail size={16} color="var(--text-muted)" />
              <input
                id="auth-email"
                type="email"
                className="search-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">
              Password
            </label>
            <div className="search-input-wrapper">
              <Lock size={16} color="var(--text-muted)" />
              <input
                id="auth-password"
                type="password"
                className="search-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading
              ? 'Authenticating...'
              : authModalMode === 'signin'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
