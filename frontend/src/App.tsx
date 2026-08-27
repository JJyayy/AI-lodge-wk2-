import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { Sidebar } from './components/Sidebar';
import { TaskInputForm } from './components/TaskInputForm';
import { FilterToolbar } from './components/FilterToolbar';
import { TaskList } from './components/TaskList';
import { TaskDetailModal } from './components/TaskDetailModal';
import { AuthModal } from './components/AuthModal';
import { StatusBanner } from './components/StatusBanner';
import { ToastContainer } from './components/ToastContainer';
import { storageService } from './services/storage';

const TaskFlowMain: React.FC = () => {
  const { activeDetailTask, closeDetailModal } = useTasks();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => storageService.getThemePreference());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    storageService.setThemePreference(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-root">
      <Navbar theme={theme} onToggleTheme={toggleTheme} />
      <StatusBanner />

      <main className="app-container">
        <StatsOverview />

        <div className="main-content-layout">
          <Sidebar />

          <div style={{ minWidth: 0 }}>
            <TaskInputForm />
            <FilterToolbar />
            <TaskList />
          </div>
        </div>
      </main>

      {activeDetailTask && (
        <TaskDetailModal
          task={activeDetailTask}
          onClose={closeDetailModal}
        />
      )}

      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <TaskProvider>
        <TaskFlowMain />
      </TaskProvider>
    </AuthProvider>
  );
};

export default App;
