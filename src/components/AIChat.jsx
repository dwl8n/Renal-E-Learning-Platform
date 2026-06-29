import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context';
import { getMockResponse } from '../mockAI';
import { linkGlossaryTerms } from '../utils/linkGlossary';
import './AIChat.css';

const DISCLAIMER = 'This AI supports your learning. Always confirm clinical decisions with your preceptor or unit policy.';

const SUGGESTED = [
  'Explain ultrafiltration in simple terms',
  'What is the normal potassium range?',
  'Quiz me on bloodwork values',
  'What happens if a patient\'s potassium is critically high?',
  'How do I calculate UF rate?',
];

export default function AIChat({ fullPage = false }) {
  const { state, dispatch } = useApp();
  const openJournal = (target) => dispatch({ type: 'JOURNAL_OPEN', target });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const messages = state.aiMessages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text) {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    dispatch({ type: 'AI_MESSAGE', msg: { role: 'user', content: userMsg, id: Date.now() } });
    setLoading(true);
    // Simulate slight delay for realism
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));
    const reply = getMockResponse(userMsg);
    dispatch({ type: 'AI_MESSAGE', msg: { role: 'assistant', content: reply, id: Date.now() + 1 } });
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const isEmpty = messages.length === 0;

  if (!fullPage) {
    return (
      <div className="aichat-dock">
        {state.aiChatOpen && (
          <div className="aichat-panel fade-in">
            <div className="aichat-panel__header">
              <span className="aichat-panel__title">
                <AISparkle /> Practice Assistant
              </span>
              <button className="aichat-panel__close" onClick={() => dispatch({ type: 'AI_CLOSE' })}>
                ✕
              </button>
            </div>
            <div className="aichat-panel__disclaimer">{DISCLAIMER}</div>
            <div className="aichat-panel__messages">
              {isEmpty && (
                <div className="aichat-empty">
                  <p className="aichat-empty__text">Ask me anything about hemodialysis orientation.</p>
                  <div className="aichat-suggestions">
                    {SUGGESTED.slice(0, 3).map(s => (
                      <button key={s} className="aichat-suggestion" onClick={() => send(s)}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map(m => (
                <ChatMessage key={m.id} message={m} onOpenJournal={openJournal} />
              ))}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
            <div className="aichat-panel__input-row">
              <textarea
                className="aichat-panel__input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask a question..."
                rows={1}
              />
              <button className="aichat-panel__send btn btn--primary btn--sm" onClick={() => send()} disabled={!input.trim() || loading}>
                <SendIcon />
              </button>
            </div>
            <button className="aichat-panel__expand" onClick={() => { dispatch({ type: 'AI_CLOSE' }); dispatch({ type: 'NAV', page: 'ai' }); }}>
              Open full chat ↗
            </button>
          </div>
        )}
        <button
          className={`aichat-fab ${state.aiChatOpen ? 'aichat-fab--active' : ''}`}
          onClick={() => dispatch({ type: 'AI_TOGGLE' })}
          aria-label="Practice Assistant"
        >
          {state.aiChatOpen ? <span style={{fontSize:18}}>✕</span> : <ChatBubble />}
        </button>
      </div>
    );
  }

  // Full page mode
  return (
    <div className="aichat-full fade-in">
      <div className="aichat-full__disclaimer">{DISCLAIMER}</div>
      <div className="aichat-full__messages">
        {isEmpty && (
          <div className="aichat-empty aichat-empty--full">
            <AISparkle size={40} />
            <h3>Hemodialysis Practice Assistant</h3>
            <p>Ask questions, get explanations, or request a practice quiz for orientation learning.</p>
            <div className="aichat-suggestions aichat-suggestions--full">
              {SUGGESTED.map(s => (
                <button key={s} className="aichat-suggestion" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map(m => (
          <ChatMessage key={m.id} message={m} onOpenJournal={openJournal} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
      <div className="aichat-full__input-row">
        <textarea
          className="aichat-full__input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask a question about hemodialysis orientation..."
          rows={2}
        />
        <button className="btn btn--primary" onClick={() => send()} disabled={!input.trim() || loading}>
          <SendIcon /> Send
        </button>
      </div>
    </div>
  );
}

function ChatMessage({ message, onOpenJournal }) {
  const isUser = message.role === 'user';
  return (
    <div className={`chat-msg ${isUser ? 'chat-msg--user' : 'chat-msg--ai'}`}>
      {!isUser && <div className="chat-msg__avatar"><AISparkle /></div>}
      <div className="chat-msg__bubble">
        {isUser ? message.content : <MarkdownLite text={message.content} onOpenJournal={onOpenJournal} />}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-msg chat-msg--ai">
      <div className="chat-msg__avatar"><AISparkle /></div>
      <div className="chat-msg__bubble chat-msg__bubble--typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

// Minimal markdown renderer: **bold**, _italic_, *italic*, `code`, > blockquote, - list, 1. list, | table
function MarkdownLite({ text, onOpenJournal }) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table
    if (line.startsWith('| ')) {
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter(l => !l.match(/^\|[-| ]+\|$/));
      elements.push(
        <table key={`t${i}`} className="md-table">
          <tbody>
            {rows.map((r, ri) => {
              const cells = r.split('|').slice(1, -1).map(c => c.trim());
              const Tag = ri === 0 ? 'th' : 'td';
              return <tr key={ri}>{cells.map((c, ci) => <Tag key={ci}>{inlineFormat(c, onOpenJournal, `${i}-${ri}-${ci}`)}</Tag>)}</tr>;
            })}
          </tbody>
        </table>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(<blockquote key={i} className="md-blockquote">{inlineFormat(line.slice(2), onOpenJournal, i)}</blockquote>);
      i++;
      continue;
    }

    // Unordered list — collect consecutive items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = [];
      const start = i;
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul${start}`} className="md-list">
          {items.map((item, j) => <li key={j}>{inlineFormat(item, onOpenJournal, `${start}-li-${j}`)}</li>)}
        </ul>
      );
      continue;
    }

    // Ordered list — collect consecutive items
    if (/^\d+\. /.test(line)) {
      const items = [];
      const start = i;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={`ol${start}`} className="md-list">
          {items.map((item, j) => <li key={j}>{inlineFormat(item, onOpenJournal, `${start}-oli-${j}`)}</li>)}
        </ol>
      );
      continue;
    }

    // Empty line
    if (line === '') {
      elements.push(<div key={i} className="md-gap" />);
      i++;
      continue;
    }

    elements.push(<p key={i}>{inlineFormat(line, onOpenJournal, i)}</p>);
    i++;
  }

  return <div className="md">{elements}</div>;
}

// Renders **bold**, _italic_, *italic*, `code`, and glossary links
function inlineFormat(text, onOpenJournal, keyBase = 0) {
  const mdParts = text.split(/(\*\*[^*]+?\*\*|`[^`]+`|_[^_\n]+_|\*[^*\n]+\*)/g);
  const result = [];

  mdParts.forEach((part, i) => {
    const key = `${keyBase}-md-${i}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      result.push(<strong key={key}>{part.slice(2, -2)}</strong>);
    } else if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      result.push(<code key={key} className="md-code">{part.slice(1, -1)}</code>);
    } else if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      result.push(<em key={key}>{part.slice(1, -1)}</em>);
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      result.push(<em key={key}>{part.slice(1, -1)}</em>);
    } else if (onOpenJournal && part) {
      const linked = linkGlossaryTerms(part, onOpenJournal);
      linked.forEach((chunk, j) => {
        if (typeof chunk === 'string') {
          result.push(<span key={`${keyBase}-gl-${i}-${j}`}>{chunk}</span>);
        } else {
          result.push(chunk);
        }
      });
    } else if (part) {
      result.push(part);
    }
  });

  return result;
}

function AISparkle({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  );
}

function ChatBubble() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
