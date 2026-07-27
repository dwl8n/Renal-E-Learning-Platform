import { useApp } from '../context';
import { GLOSSARY, FORMULAS, CRITICAL_VALUES_TABLE } from '../data';
import { slugify } from '../utils/linkGlossary';

// ─── Target resolvers ─────────────────────────────────────────────────────────
// Each resolver turns an author-friendly name into a { tab, ...slug } target the
// JournalPanel knows how to scroll to and highlight.

function resolveGlossary(name) {
  const key = name.trim().toLowerCase();
  const entry = GLOSSARY.find(g => {
    const main = g.term.replace(/\s*\([^)]*\)\s*/g, ' ').trim().toLowerCase();
    const abbrev = (g.term.match(/\(([A-Za-z/]+)\)/) || [])[1]?.toLowerCase();
    return main === key || abbrev === key || g.term.toLowerCase() === key;
  });
  return entry ? { tab: 'glossary', termSlug: slugify(entry.term) } : null;
}

function resolveFormula(name) {
  const key = name.trim().toLowerCase();
  const entry = FORMULAS.find(f => f.name.toLowerCase().includes(key) || key.includes(f.name.toLowerCase()));
  return entry ? { tab: 'formulas', formulaSlug: slugify(entry.name) } : null;
}

function resolveCritical(name) {
  const key = name.trim().toLowerCase();
  const entry = CRITICAL_VALUES_TABLE.find(r => r.test.toLowerCase().startsWith(key) || r.test.toLowerCase().includes(key));
  return entry ? { tab: 'critical', testSlug: slugify(entry.test) } : null;
}

/**
 * A small "(?)" help button placed next to a clinical value, procedure, or
 * concept. Clicking it opens the Journal to the specific reference entry.
 *
 * Usage — pick exactly one destination shorthand (or pass an explicit target):
 *   <RefTip term="Ultrafiltration" />
 *   <RefTip formula="UF Rate" />
 *   <RefTip critical="Potassium" />
 *   <RefTip target={{ tab: 'journal' }} label="Open the reading" />
 */
export default function RefTip({ term, formula, critical, target, label }) {
  const { dispatch } = useApp();

  const resolved = target
    || (term && resolveGlossary(term))
    || (formula && resolveFormula(formula))
    || (critical && resolveCritical(critical));

  if (!resolved) {
    if (import.meta.env?.DEV) {
      console.warn('[RefTip] Could not resolve target for', { term, formula, critical });
    }
    return null;
  }

  const aria = label
    || (term ? `What is ${term}?`
      : formula ? `Show the ${formula} formula`
      : critical ? `Reference values for ${critical}`
      : 'Open reference');

  return (
    <button
      type="button"
      className="ref-tip"
      aria-label={aria}
      title={aria}
      onClick={() => dispatch({ type: 'JOURNAL_OPEN', target: resolved })}
    >
      ?
    </button>
  );
}
