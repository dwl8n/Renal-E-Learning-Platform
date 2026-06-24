import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { GLOSSARY, FORMULAS, CRITICAL_VALUES_TABLE, FLUID_READING_PAGES, INFECTION_READING_PAGES, BLOODWORK_READING_SECTIONS, BVM_READING_PAGES } from '../data';
import './JournalPanel.css';

const JOURNAL_CONTENT = {
  'fluid-volume': {
    title: 'Fluid Volume Calculation',
    pages: FLUID_READING_PAGES,
  },
  'infection-control': {
    title: 'Infection Control & Hep B',
    pages: INFECTION_READING_PAGES,
  },
  'bloodwork-values': {
    title: 'Bloodwork Values',
    pages: [{ title: 'What We Test and Why', sections: BLOODWORK_READING_SECTIONS }],
  },
  'intradialytic-fluid': {
    title: 'Intradialytic Fluid Removal',
    pages: BVM_READING_PAGES,
  },
};

const TABS = [
  { id: 'journal',  label: 'Journal' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'formulas', label: 'Formulas' },
  { id: 'critical', label: 'Critical Values' },
  { id: 'policies', label: 'Unit Policies', stub: true },
];

export default function JournalPanel() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('journal');
  const [glossarySearch, setGlossarySearch] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const panelRef = useRef(null);
  const closeTimerRef = useRef(null);

  const { journalOpen, journalTarget, journalEntries } = state;

  // Sync tab when opened with a target
  useEffect(() => {
    if (journalOpen && journalTarget?.tab) {
      setActiveTab(journalTarget.tab);
      setIsClosing(false);
    }
    if (!journalOpen && !isClosing) {
      setGlossarySearch('');
    }
  }, [journalOpen, journalTarget]);

  // Close on Escape
  useEffect(() => {
    if (!journalOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') closeWithAnimation();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [journalOpen]);

  function closeWithAnimation() {
    setIsClosing(true);
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      dispatch({ type: 'JOURNAL_CLOSE' });
      setIsClosing(false);
    }, 220);
  }

  if (!journalOpen && !isClosing) return null;

  return (
    <div
      className={`journal-overlay ${isClosing ? 'journal-overlay--closing' : ''}`}
      onClick={closeWithAnimation}
    >
      <div
        className={`journal-panel ${isClosing ? 'journal-panel--closing' : ''}`}
        ref={panelRef}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Journal"
      >
        {/* Header */}
        <div className="journal-panel__header">
          <div className="journal-panel__title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Journal
          </div>
          <button
            className="journal-panel__close"
            onClick={closeWithAnimation}
            aria-label="Close journal"
          >×</button>
        </div>

        {/* Tab bar */}
        <div className="journal-tabs" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`journal-tab ${activeTab === t.id ? 'journal-tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              role="tab"
              aria-selected={activeTab === t.id}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="journal-panel__content">
          {activeTab === 'journal' && (
            <JournalTab entries={journalEntries} />
          )}
          {activeTab === 'glossary' && (
            <GlossaryTab
              search={glossarySearch}
              setSearch={setGlossarySearch}
              targetSlug={journalOpen && journalTarget?.tab === 'glossary' ? journalTarget.termSlug : null}
            />
          )}
          {activeTab === 'formulas' && <FormulasTab />}
          {activeTab === 'critical' && <CriticalValuesTab />}
          {activeTab === 'policies' && <StubTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Journal subtab (two-column) ──────────────────────────────────────────────
function JournalTab({ entries }) {
  // Build flat page list: [{ questId, pageIdx, questTitle, pageTitle }]
  const pages = [];
  entries.forEach(questId => {
    const content = JOURNAL_CONTENT[questId];
    if (!content) return;
    content.pages.forEach((p, i) => {
      pages.push({ questId, pageIdx: i, questTitle: content.title, pageTitle: p.title });
    });
  });

  const [selected, setSelected] = useState(0);

  if (pages.length === 0) {
    return (
      <div className="journal-empty">
        <div className="journal-empty__icon">📖</div>
        <p className="journal-empty__title">Your Journal is empty</p>
        <p className="journal-empty__hint">Complete reading tasks to add pages here. They'll stay available forever.</p>
      </div>
    );
  }

  const current = pages[selected];
  const content = JOURNAL_CONTENT[current.questId];
  const page = content.pages[current.pageIdx];

  return (
    <div className="journal-two-col">
      <nav className="journal-nav">
        {pages.map((p, i) => (
          <button
            key={`${p.questId}-${p.pageIdx}`}
            className={`journal-nav__item ${selected === i ? 'journal-nav__item--active' : ''}`}
            onClick={() => setSelected(i)}
          >
            <span className="journal-nav__quest">{p.questTitle}</span>
            <span className="journal-nav__page">{p.pageTitle}</span>
          </button>
        ))}
      </nav>
      <div className="journal-reader">
        <h3 className="journal-reader__title">{page.title}</h3>
        {page.sections.map((s, i) => (
          <div key={i} className="journal-section">
            <h4 className="journal-section__heading">{s.heading}</h4>
            <p className="journal-section__body">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Glossary subtab ──────────────────────────────────────────────────────────
function slugify(term) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function GlossaryTab({ search, setSearch, targetSlug }) {
  const filtered = GLOSSARY.filter(g =>
    !search || g.term.toLowerCase().includes(search.toLowerCase()) || g.def.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (targetSlug) {
      const el = document.getElementById(`glossary-${targetSlug}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [targetSlug]);

  return (
    <div>
      <div className="journal-search">
        <input
          className="journal-search__input"
          type="text"
          placeholder="Search terms…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      <div className="glossary-list">
        {filtered.map(g => {
          const slug = slugify(g.term);
          const isTarget = targetSlug === slug;
          return (
            <div
              key={g.term}
              id={`glossary-${slug}`}
              className={`glossary-entry ${isTarget ? 'glossary-entry--highlight' : ''}`}
            >
              <div className="glossary-entry__term">{g.term}</div>
              <div className="glossary-entry__def">{g.def}</div>
              {g.quest && <div className="glossary-entry__quest">Related quest: {g.quest}</div>}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{color:'var(--text-300)', fontSize:13, padding:'12px 0'}}>No matching terms.</p>
        )}
      </div>
    </div>
  );
}

// ─── Formulas subtab ──────────────────────────────────────────────────────────
function FormulasTab() {
  return (
    <div className="formulas-list">
      {FORMULAS.map(f => (
        <div key={f.name} className="formula-card">
          <div className="formula-card__name">{f.name}</div>
          <code className="formula-card__formula">{f.formula}</code>
          <p className="formula-card__notes">{f.notes}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Critical Values subtab ───────────────────────────────────────────────────
function CriticalValuesTab() {
  return (
    <div className="critical-wrap">
      <table className="critical-table">
        <thead>
          <tr>
            <th>Test</th><th>Unit</th><th>Normal</th><th>Crit. Low</th><th>Crit. High</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {CRITICAL_VALUES_TABLE.map(row => (
            <tr key={row.test}>
              <td>{row.test}</td><td>{row.unit}</td><td>{row.normal}</td>
              <td style={{color: row.critLow !== '—' ? 'var(--red-400)' : undefined}}>{row.critLow}</td>
              <td style={{color: row.critHigh !== '—' ? 'var(--red-400)' : undefined}}>{row.critHigh}</td>
              <td>{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StubTab() {
  return (
    <div className="journal-stub">
      <div className="journal-empty__icon">🚧</div>
      <p className="journal-empty__title">Unit Policies</p>
      <p className="journal-empty__hint">Region-specific protocols and unit procedures will appear here.</p>
    </div>
  );
}
