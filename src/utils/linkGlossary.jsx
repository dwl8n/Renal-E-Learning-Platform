import { GLOSSARY } from '../data';

// Build lookup map: normalised match string → full glossary entry
const TERM_MAP = new Map();

GLOSSARY.forEach(g => {
  // Strip parenthetical abbreviation for the primary match key ("Ultrafiltration (UF)" → "ultrafiltration")
  const mainTerm = g.term.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  TERM_MAP.set(mainTerm.toLowerCase(), g);

  // Also match the abbreviation itself ("UF", "AVF", "Kt/V", etc.)
  const abbrevMatch = g.term.match(/\(([A-Za-z/]+)\)/);
  if (abbrevMatch && !TERM_MAP.has(abbrevMatch[1].toLowerCase())) {
    TERM_MAP.set(abbrevMatch[1].toLowerCase(), g);
  }
});

// Sort longest first so "Arteriovenous Fistula" matches before "Fistula"
const SORTED_KEYS = [...TERM_MAP.keys()].sort((a, b) => b.length - a.length);

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildPattern() {
  return new RegExp(`\\b(${SORTED_KEYS.map(escapeRe).join('|')})\\b`, 'gi');
}

export function slugify(term) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Split `text` into an array of strings and <GlossaryLink> elements.
 * `onOpen` receives { tab: 'glossary', termSlug: string }.
 */
export function linkGlossaryTerms(text, onOpen) {
  if (!text || typeof text !== 'string') return [text];

  const re = buildPattern();
  const parts = [];
  let last = 0;
  let match;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    const matchedText = match[0];
    const entry = TERM_MAP.get(matchedText.toLowerCase());

    if (entry) {
      const termSlug = slugify(entry.term);
      parts.push(
        <span
          key={`gl-${match.index}`}
          className="glossary-link"
          onClick={() => onOpen({ tab: 'glossary', termSlug })}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onOpen({ tab: 'glossary', termSlug })}
          title={`Open "${entry.term}" in Journal`}
        >
          {matchedText}
        </span>
      );
    } else {
      parts.push(matchedText);
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/**
 * Component that renders text with clickable glossary links.
 * Preserves newlines (whitespace: pre-wrap on the parent is sufficient).
 */
export function LinkedText({ text, onOpen }) {
  if (!text) return null;
  const parts = linkGlossaryTerms(text, onOpen);
  return <>{parts}</>;
}
