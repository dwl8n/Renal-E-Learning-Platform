// BARDIA EDIT — drop this file into src/ to replace the original App.jsx
// It adds login-gating and an admin dashboard route.
//
// Also required:
//   • Replace src/context.jsx with bardia edit/context.jsx
//   • Copy LoginPage.jsx / LoginPage.css into src/pages/
//   • Copy AdminDashboard.jsx / AdminDashboard.css into src/pages/

import { useApp } from './context';
import Navigation from './components/Navigation';
import AIChat from './components/AIChat';
import JournalPanel from './components/JournalPanel';
import Progress from './pages/Progress';
import Tasks from './pages/Tasks';
import Assessments from './pages/Assessments';
import AIPage from './pages/AIPage';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

export default function App() {
  const { state } = useApp();
  const { currentUser, page } = state;

  // Not logged in — show login screen
  if (!currentUser) {
    return <LoginPage />;
  }

  // Admin — show the admin dashboard (no student nav/chat)
  if (currentUser.role === 'admin') {
    return <AdminDashboard />;
  }

  // Student — normal app
  return (
    <div className="app">
      <Navigation />
      <div className="app__body">
        {page === 'progress'    && <Progress />}
        {page === 'tasks'       && <Tasks />}
        {page === 'assessments' && <Assessments />}
        {page === 'ai'          && <AIPage />}
        {page === 'settings'    && <Settings />}
      </div>
      {page !== 'ai' && <AIChat />}
      <JournalPanel />
    </div>
  );
}
