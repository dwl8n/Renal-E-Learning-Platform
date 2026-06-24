import { buildSampleResult } from './sampleData';

const API_URL = 'http://127.0.0.1:8000';

export async function checkLocalEngine() {
  try {
    const response = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(1200) });
    return response.ok;
  } catch {
    return false;
  }
}

export async function analyzeDocument({ file, useSample = false }) {
  if (useSample || !file) {
    await wait(600);
    return buildSampleResult();
  }

  const data = new FormData();
  data.append('file', file);

  try {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      body: data,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || 'Local analyzer could not process this document.');
    }
    return await response.json();
  } catch (error) {
    if (file.type.startsWith('text/') || /\.(txt|md)$/i.test(file.name)) {
      return analyzePlainText(await file.text(), file.name);
    }
    throw new Error(
      'The local Python analyzer is not running. Start it for live PDF/PPTX/DOCX analysis, or use the included sample document.',
      { cause: error },
    );
  }
}

function analyzePlainText(text, filename) {
  const clean = text.replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 40);

  const keywords = extractKeywords(clean).slice(0, 6);
  const objectives = keywords.slice(0, 5).map((keyword, index) => ({
    id: `objective-${index + 1}`,
    text: `${index < 2 ? 'Explain' : 'Apply'} the key principles related to ${keyword}.`,
    source: `Extracted text · ${filename}`,
  }));

  const quiz = sentences.slice(0, 5).map((sentence, index) => {
    const keyword = keywords[index % Math.max(keywords.length, 1)] || 'the main concept';
    return {
      id: `generated-${index + 1}`,
      topic: titleCase(keyword),
      question: `Which statement is supported by the source regarding ${keyword}?`,
      options: [
        sentence,
        `The source states that ${keyword} is never required.`,
        `${titleCase(keyword)} is unrelated to the described process.`,
        `The source provides no information about ${keyword}.`,
      ],
      correct: 0,
      explanation: sentence,
      source: `Text excerpt ${index + 1}`,
      quality: 62,
    };
  });

  return {
    source: {
      id: 'live-text',
      filename,
      displayName: filename.replace(/\.[^.]+$/, ''),
      fileType: 'Text',
      pages: 1,
      extractedWords: clean.split(/\s+/).length,
      retainedWords: clean.split(/\s+/).length,
      qualityScore: 65,
      sourceNote: 'Analyzed live in the browser by the offline prototype engine.',
    },
    analysis: {
      title: filename.replace(/\.[^.]+$/, ''),
      description: sentences.slice(0, 2).join(' '),
      audience: 'General learner',
      estimatedMinutes: Math.max(8, Math.round(clean.split(/\s+/).length / 130)),
      difficulty: 'Foundational',
      confidence: 0.61,
      topics: keywords.map((name, index) => ({ name: titleCase(name), weight: 82 - index * 6 })),
      objectives,
      moduleSections: [
        {
          id: 'generated-section-1',
          title: 'Core concepts',
          type: 'Reading',
          minutes: 5,
          summary: sentences.slice(0, 2).join(' '),
          source: filename,
        },
        {
          id: 'generated-section-2',
          title: 'Knowledge check',
          type: 'Assessment',
          minutes: 4,
          summary: 'Automatically generated review questions.',
          source: filename,
        },
      ],
      visualOpportunities: inferVisuals(clean),
      documentQuality: {
        totalChunks: Math.max(1, Math.ceil(sentences.length / 3)),
        usableChunks: Math.max(1, Math.ceil(sentences.length / 3)),
        skippedChunks: 0,
        averageScore: 65,
        skippedReasons: [],
      },
    },
    flow: [],
    flashcards: keywords.slice(0, 5).map((keyword, index) => ({
      id: `card-${index + 1}`,
      front: `What does the source explain about ${keyword}?`,
      back: sentences.find((sentence) => sentence.toLowerCase().includes(keyword)) || sentences[index] || clean.slice(0, 240),
      topic: titleCase(keyword),
      source: filename,
      quality: 55,
    })),
    quiz,
    scenario: null,
    generatedAt: new Date().toISOString(),
    generationMethod: 'Live browser heuristic analysis',
  };
}

function extractKeywords(text) {
  const stopwords = new Set([
    'about', 'after', 'again', 'against', 'also', 'and', 'are', 'because', 'been', 'before',
    'being', 'between', 'both', 'can', 'could', 'each', 'from', 'have', 'into', 'more', 'must',
    'not', 'only', 'other', 'our', 'should', 'some', 'such', 'than', 'that', 'the', 'their', 'then',
    'there', 'these', 'they', 'this', 'through', 'under', 'using', 'was', 'were', 'when', 'where',
    'which', 'while', 'will', 'with', 'would', 'your',
  ]);
  const counts = new Map();
  text
    .toLowerCase()
    .match(/[a-z][a-z-]{3,}/g)
    ?.forEach((word) => {
      if (!stopwords.has(word)) counts.set(word, (counts.get(word) || 0) + 1);
    });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

function inferVisuals(text) {
  const lower = text.toLowerCase();
  const results = [];
  if (/\b(step|procedure|first|next|finally)\b/.test(lower)) {
    results.push({
      format: 'Flowchart',
      score: 86,
      title: 'Process sequence',
      reason: 'The source contains ordered procedural language.',
    });
  }
  if (/\b(if|unless|when|criteria|decision)\b/.test(lower)) {
    results.push({
      format: 'Decision tree',
      score: 78,
      title: 'Conditional decisions',
      reason: 'The source contains conditional rules or criteria.',
    });
  }
  if (/\b(day|week|month|annual|timeline|deadline)\b/.test(lower)) {
    results.push({
      format: 'Timeline',
      score: 74,
      title: 'Important timing',
      reason: 'The source contains time-based requirements.',
    });
  }
  return results.length
    ? results
    : [{
        format: 'Concept map',
        score: 64,
        title: 'Key concept relationships',
        reason: 'A concept map can organize the most frequent themes.',
      }];
}

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
