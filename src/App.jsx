import { useApp } from './context';
import Navigation from './components/Navigation';
import AIChat from './components/AIChat';
import JournalPanel from './components/JournalPanel';
import Progress from './pages/Progress';
import Tasks from './pages/Tasks';
import Assessments from './pages/Assessments';
import AIPage from './pages/AIPage';
import Settings from './pages/Settings';
import './App.css';

export default function App() {
  const { state } = useApp();
  const { page } = state;

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
      {/* Docked AI chat — hidden on AI page (shown full-page there) */}
      {page !== 'ai' && <AIChat />}
      {/* Journal overlay — shown over any page */}
      <JournalPanel />
    </div>
  );
}
