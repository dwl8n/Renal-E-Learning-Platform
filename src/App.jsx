import { useApp } from './context';
import Navigation from './components/Navigation';
import AIChat from './components/AIChat';
import JournalPanel from './components/JournalPanel';
import CourseCatalogue from './pages/CourseCatalogue';
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

  if (!currentUser) {
    return <LoginPage />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="app">
      <Navigation />
      <div className="app__body">
        {page === 'catalogue'   && <CourseCatalogue />}
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
