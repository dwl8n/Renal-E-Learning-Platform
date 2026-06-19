import { useState } from 'react';
import { CRITICAL_VALUES_TABLE, FORMULAS, GLOSSARY } from '../data';
import './Reference.css';

const SECTIONS = [
  { id: 'glossary', label: 'Glossary' },
  { id: 'formulas', label: 'Formulas' },
  { id: 'critical', label: 'Critical Values' },
  { id: 'docs', label: 'Documentation' },
  { id: 'policies', label: 'Unit Policies' },
];

export default function Reference() {
  const [section, setSection] = useState('glossary');
  const [search, setSearch] = useState('');

  return (
    <div className="reference-page fade-in">
      <aside className="reference-sidebar">
        <div className="reference-sidebar__header">
          <h2>Reference</h2>
          <p>Open-book knowledge base</p>
        </div>
        <nav className="reference-nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`reference-nav__item ${section === s.id ? 'reference-nav__item--active' : ''}`}
              onClick={() => setSection(s.id)}
            >
              {s.label}
              {(s.id === 'docs' || s.id === 'policies') && <span className="badge badge--grey" style={{fontSize:10}}>Stub</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="reference-main">
        {section === 'glossary' && <GlossarySection search={search} setSearch={setSearch} />}
        {section === 'formulas' && <FormulasSection />}
        {section === 'critical' && <CriticalValuesSection />}
        {section === 'docs' && <StubSection title="Documentation" desc="Embedded PDFs of orientation source documents will be available here. Read-only reference material." />}
        {section === 'policies' && <StubSection title="Unit Policies" desc="Region-specific protocols, including the Potassium Protocol steps and other unit-specific procedures, will appear here." />}
      </main>
    </div>
  );
}

function GlossarySection({ search, setSearch }) {
  const filtered = GLOSSARY.filter(g =>
    g.term.toLowerCase().includes(search.toLowerCase()) ||
    g.def.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="reference-section fade-in">
      <div className="reference-section__header">
        <h2>Glossary</h2>
        <input
          className="reference-search"
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <p className="reference-section__count">{filtered.length} term{filtered.length !== 1 ? 's' : ''}</p>
      <div className="glossary-list">
        {filtered.map(g => (
          <div key={g.term} className="glossary-item card">
            <div className="glossary-item__term">{g.term}</div>
            <div className="glossary-item__def">{g.def}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormulasSection() {
  return (
    <div className="reference-section fade-in">
      <div className="reference-section__header">
        <h2>Formulas</h2>
      </div>
      <div className="formulas-list">
        {FORMULAS.map(f => (
          <div key={f.name} className="formula-card card">
            <div className="formula-card__name">{f.name}</div>
            <div className="formula-card__formula">{f.formula}</div>
            <div className="formula-card__notes">{f.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CriticalValuesSection() {
  return (
    <div className="reference-section fade-in">
      <div className="reference-section__header">
        <h2>Critical Values Table</h2>
        <span className="badge badge--red">Not open-book during assessment</span>
      </div>
      <p className="reference-section__note">
        This table is available outside of formal assessments. During the Bloodwork Values assessment, this panel is not accessible.
      </p>
      <div className="critical-table-wrap card">
        <table className="critical-table">
          <thead>
            <tr>
              <th>Test</th>
              <th>Unit</th>
              <th>Normal Range</th>
              <th>Critical Low</th>
              <th>Critical High</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {CRITICAL_VALUES_TABLE.map(row => (
              <tr key={row.test}>
                <td><strong>{row.test}</strong></td>
                <td className="critical-table__unit">{row.unit}</td>
                <td>{row.normal}</td>
                <td className="critical-table__crit-low">{row.critLow}</td>
                <td className="critical-table__crit-high">{row.critHigh}</td>
                <td className="critical-table__action">{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StubSection({ title, desc }) {
  return (
    <div className="reference-section fade-in">
      <div className="reference-section__header">
        <h2>{title}</h2>
        <span className="badge badge--grey">Coming Soon</span>
      </div>
      <div className="stub-section card">
        <div style={{fontSize:32, marginBottom:12}}>📋</div>
        <p>{desc}</p>
      </div>
    </div>
  );
}
