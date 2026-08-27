import React, { useRef, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Moon,
  Sun,
  Download,
  Upload,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  const { user, openAuthModal, signOut } = useAuth();
  const { filterState, setFilterState, exportData, importData } = useTasks();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcuts (Ctrl+K for search, Alt+D for theme)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.altKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onToggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleTheme]);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importData(content);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar-brand">
        <div className="navbar-logo-icon">
          <CheckSquare size={18} strokeWidth={2.5} />
        </div>
        <span>TaskFlow</span>
      </div>

      <div className="navbar-search-container">
        <div className="search-input-wrapper">
          <Search size={16} color="var(--text-muted)" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search tasks... (Ctrl+K)"
            value={filterState.searchQuery}
            onChange={(e) => setFilterState({ searchQuery: e.target.value })}
            aria-label="Search tasks"
          />
          <kbd className="search-shortcut-badge">Ctrl K</kbd>
        </div>
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          className="btn-icon"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode (Alt+D)`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="btn-icon"
          onClick={exportData}
          title="Export data as JSON"
          aria-label="Export data as JSON"
        >
          <Download size={18} />
        </button>

        <button
          type="button"
          className="btn-icon"
          onClick={() => fileInputRef.current?.click()}
          title="Import tasks from JSON"
          aria-label="Import tasks from JSON"
        >
          <Upload size={18} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileImport}
        />

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                maxWidth: '140px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={user.email}
            >
              {user.email}
            </span>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
              onClick={() => signOut()}
              title="Sign Out"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-primary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => openAuthModal('signin')}
          >
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
