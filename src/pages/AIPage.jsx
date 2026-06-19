import AIChat from '../components/AIChat';
import './AIPage.css';

export default function AIPage() {
  return (
    <div className="ai-page fade-in">
      <div className="ai-page__inner">
        <div className="ai-page__header">
          <h1 className="page-title">AI Assistant</h1>
          <p className="page-subtitle">Context-aware support for hemodialysis orientation learning.</p>
        </div>
        <div className="ai-page__chat-wrap card">
          <AIChat fullPage />
        </div>
      </div>
    </div>
  );
}
