"""Deterministic content-analysis and quiz-generation engine.

This is deliberately a modest, explainable MVP engine rather than a claim of
LLM-level intelligence. It proves the workflow contract: source -> cleaned
chunks -> analysis -> learning plan -> draft activities -> quality review.
The functions can later be replaced by Gemini, Claude, OpenAI or Ollama calls
without changing the frontend's data structure.
"""

from __future__ import annotations

import math
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

BOILERPLATE_TERMS = (
    "valid only on date printed",
    "all rights reserved",
    "copyright",
    "http://",
    "https://",
    "page ",
)

STOPWORDS = {
    "about", "after", "again", "against", "also", "and", "are", "because", "been",
    "before", "being", "between", "blood", "both", "can", "care", "complete", "could",
    "current", "each", "following", "for", "form", "from", "have", "into", "level",
    "levels", "mmol", "more", "must", "not", "only", "other", "patient", "patients",
    "process", "should", "some", "specific", "such", "than", "that", "the", "their",
    "then", "there", "these", "they", "this", "through", "under", "used", "using",
    "value", "values", "was", "were", "when", "where", "which", "while", "will",
    "with", "would", "your",
}


def analyze_document(filename: str, extracted: dict) -> dict:
    raw_units = extracted["units"]
    chunks, skipped = _clean_and_chunk(raw_units)
    combined = "\n".join(chunk["text"] for chunk in chunks)
    word_count = len(re.findall(r"\b\w+\b", combined))
    raw_word_count = sum(len(re.findall(r"\b\w+\b", unit["text"])) for unit in raw_units)

    keywords = _keywords(combined, 8)
    title = _infer_title(filename, raw_units)
    topics = [
        {"name": keyword.title(), "weight": max(45, 94 - index * 7)}
        for index, keyword in enumerate(keywords[:6])
    ]
    objectives = _build_objectives(keywords, chunks)
    sections = _build_sections(title, chunks, keywords)
    visuals = _recommend_visuals(combined)
    quiz = _build_quiz(chunks, keywords)
    flashcards = _build_flashcards(chunks, keywords)

    average_quality = round(
        sum(chunk["quality"] for chunk in chunks) / max(1, len(chunks))
    )

    source = {
        "id": _slug(Path(filename).stem),
        "filename": filename,
        "displayName": title,
        "fileType": extracted["kind"],
        "pages": extracted["unit_count"],
        "extractedWords": raw_word_count,
        "retainedWords": word_count,
        "qualityScore": average_quality,
        "sourceNote": "Processed locally. No document content was sent to an external service.",
    }

    analysis = {
        "title": title,
        "description": _summary(chunks),
        "audience": "Trainer-selected learner group",
        "estimatedMinutes": max(8, round(word_count / 130)),
        "difficulty": "Foundational",
        "confidence": round(min(0.84, 0.48 + average_quality / 250), 2),
        "topics": topics,
        "objectives": objectives,
        "moduleSections": sections,
        "visualOpportunities": visuals,
        "documentQuality": {
            "totalChunks": len(chunks) + len(skipped),
            "usableChunks": len(chunks),
            "skippedChunks": len(skipped),
            "averageScore": average_quality,
            "skippedReasons": sorted({item["reason"] for item in skipped})[:4],
        },
    }

    return {
        "source": source,
        "analysis": analysis,
        "flow": _build_flow(chunks) if any(v["format"] == "Flowchart" for v in visuals) else [],
        "flashcards": flashcards,
        "quiz": quiz,
        "scenario": _build_scenario(chunks),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "generationMethod": "Local deterministic prototype engine",
    }


def _clean_and_chunk(units: list[dict]) -> tuple[list[dict], list[dict]]:
    chunks = []
    skipped = []
    for unit in units:
        normalized = re.sub(r"\r\n?", "\n", unit["text"])
        paragraphs = [
            re.sub(r"\s+", " ", paragraph).strip()
            for paragraph in re.split(r"\n\s*\n|\n(?=[A-Z][^\n]{0,80}$)", normalized)
        ]
        expanded_paragraphs = []
        for paragraph in paragraphs:
            if len(paragraph.split()) <= 110:
                expanded_paragraphs.append(paragraph)
                continue
            sentences = [
                sentence.strip()
                for sentence in re.split(r"(?<=[.!?])\s+", paragraph)
                if sentence.strip()
            ]
            if len(sentences) <= 2:
                words = paragraph.split()
                expanded_paragraphs.extend(
                    " ".join(words[index : index + 90])
                    for index in range(0, len(words), 90)
                )
            else:
                expanded_paragraphs.extend(
                    " ".join(sentences[index : index + 3])
                    for index in range(0, len(sentences), 3)
                )

        for paragraph in expanded_paragraphs:
            if not paragraph:
                continue
            lowered = paragraph.lower()
            score = 70
            reason = None
            if len(paragraph.split()) < 8:
                score -= 35
                reason = "Too little educational content"
            if sum(term in lowered for term in BOILERPLATE_TERMS) >= 2:
                score -= 45
                reason = "Header, footer or legal boilerplate"
            if paragraph.count("|") > 12:
                score -= 15
            if re.search(r"\b(step|procedure|purpose|definition|criteria|must|should|if|when)\b", lowered):
                score += 16
            if re.search(r"\b(\d+\s*(day|week|month|hour)|within|at least|greater than)\b", lowered):
                score += 8
            score = max(0, min(100, score))
            record = {
                "label": unit["label"],
                "text": paragraph,
                "quality": score,
                "reason": reason,
            }
            if score >= 45:
                chunks.append(record)
            else:
                skipped.append(record)
    return chunks, skipped


def _keywords(text: str, limit: int) -> list[str]:
    words = re.findall(r"[a-z][a-z-]{3,}", text.lower())
    counts = Counter(word for word in words if word not in STOPWORDS)
    return [word for word, _ in counts.most_common(limit)]


def _infer_title(filename: str, units: list[dict]) -> str:
    for unit in units[:2]:
        for line in unit["text"].splitlines():
            candidate = re.sub(r"\s+", " ", line).strip(" -:")
            if 5 <= len(candidate) <= 110 and len(candidate.split()) >= 2:
                if not any(term in candidate.lower() for term in BOILERPLATE_TERMS):
                    return candidate
    return Path(filename).stem.replace("_", " ").replace("-", " ").strip()


def _summary(chunks: list[dict]) -> str:
    sentences = []
    for chunk in chunks:
        sentences.extend(re.split(r"(?<=[.!?])\s+", chunk["text"]))
    useful = [sentence.strip() for sentence in sentences if 60 <= len(sentence.strip()) <= 260]
    return " ".join(useful[:2]) or (chunks[0]["text"][:380] if chunks else "No summary available.")


def _build_objectives(keywords: list[str], chunks: list[dict]) -> list[dict]:
    verbs = ["Explain", "Identify", "Apply", "Distinguish", "Sequence"]
    results = []
    for index, keyword in enumerate(keywords[:5]):
        chunk = next(
            (item for item in chunks if keyword in item["text"].lower()),
            chunks[min(index, len(chunks) - 1)] if chunks else {"label": "Source"},
        )
        results.append(
            {
                "id": f"objective-{index + 1}",
                "text": f"{verbs[index]} the source-based requirements related to {keyword}.",
                "source": chunk["label"],
            }
        )
    return results


def _build_sections(title: str, chunks: list[dict], keywords: list[str]) -> list[dict]:
    section_types = ["Reading", "Concept map", "Guided practice", "Assessment"]
    sections = []
    groups = _group(chunks, 4)
    for index, group in enumerate(groups[:4]):
        keyword = keywords[index] if index < len(keywords) else f"Part {index + 1}"
        sections.append(
            {
                "id": f"section-{index + 1}",
                "title": f"{keyword.title()} essentials" if index else f"Introduction to {title}",
                "type": section_types[index],
                "minutes": max(3, round(sum(len(item["text"].split()) for item in group) / 100)),
                "summary": _truncate(" ".join(item["text"] for item in group), 240),
                "source": ", ".join(dict.fromkeys(item["label"] for item in group)),
            }
        )
    return sections


def _recommend_visuals(text: str) -> list[dict]:
    lowered = text.lower()
    results = []
    if re.search(r"\b(step|procedure|first|next|once|finally)\b", lowered):
        results.append(
            {
                "format": "Flowchart",
                "score": 90,
                "title": "Source procedure",
                "reason": "Ordered actions and handoffs were detected.",
            }
        )
    if re.search(r"\b(if|unless|criteria|when|referral|decision)\b", lowered):
        results.append(
            {
                "format": "Decision tree",
                "score": 84,
                "title": "Conditional decisions",
                "reason": "The source contains conditional rules and escalation criteria.",
            }
        )
    if re.search(r"\b(day|week|month|annual|frequency|within)\b", lowered):
        results.append(
            {
                "format": "Timeline",
                "score": 79,
                "title": "Timing requirements",
                "reason": "Multiple time-based requirements were detected.",
            }
        )
    results.append(
        {
            "format": "Short video script",
            "score": 66,
            "title": "Narrated concept walkthrough",
            "reason": "A short narration can reinforce the module's main concepts.",
        }
    )
    return results


def _build_quiz(chunks: list[dict], keywords: list[str]) -> list[dict]:
    questions = []
    candidates = sorted(chunks, key=lambda item: item["quality"], reverse=True)
    for index, chunk in enumerate(candidates[:5]):
        keyword = next(
            (word for word in keywords if word in chunk["text"].lower()),
            keywords[index % len(keywords)] if keywords else "main requirement",
        )
        correct = _truncate(chunk["text"], 210)
        questions.append(
            {
                "id": f"question-{index + 1}",
                "topic": keyword.title(),
                "question": f"Which statement is supported by the source regarding {keyword}?",
                "options": [
                    correct,
                    f"The source states that {keyword} is optional in every circumstance.",
                    f"{keyword.title()} is unrelated to the process described in the document.",
                    f"The source recommends skipping {keyword} when time is limited.",
                ],
                "correct": 0,
                "explanation": correct,
                "source": chunk["label"],
                "quality": min(82, chunk["quality"]),
            }
        )
    return questions


def _build_flashcards(chunks: list[dict], keywords: list[str]) -> list[dict]:
    cards = []
    for index, keyword in enumerate(keywords[:6]):
        chunk = next((item for item in chunks if keyword in item["text"].lower()), None)
        if not chunk:
            continue
        cards.append(
            {
                "id": f"flashcard-{index + 1}",
                "front": f"What key requirement does the source describe about {keyword}?",
                "back": _truncate(chunk["text"], 260),
                "topic": keyword.title(),
                "source": chunk["label"],
                "quality": min(78, chunk["quality"]),
            }
        )
    return cards


def _build_flow(chunks: list[dict]) -> list[dict]:
    procedural = [
        chunk
        for chunk in chunks
        if re.search(r"\b(step|first|once|then|after|before|complete|enter|review)\b", chunk["text"].lower())
    ]
    flow = []
    for index, chunk in enumerate(procedural[:4]):
        first_sentence = re.split(r"(?<=[.!?])\s+", chunk["text"])[0]
        flow.append(
            {
                "step": f"{index + 1:02d}",
                "role": "Assigned role",
                "title": _truncate(first_sentence, 70),
                "body": _truncate(chunk["text"], 260),
                "completion": "Trainer review required before publishing this generated step.",
                "source": chunk["label"],
            }
        )
    return flow


def _build_scenario(chunks: list[dict]) -> dict | None:
    conditional = next(
        (chunk for chunk in chunks if re.search(r"\b(if|when|criteria|more than|unless)\b", chunk["text"].lower())),
        None,
    )
    if not conditional:
        return None
    fact = _truncate(conditional["text"], 270)
    return {
        "id": "scenario-1",
        "title": "Apply the source rule",
        "prompt": f"A learner encounters the following situation: {fact} What action is best supported by the source?",
        "options": [
            "Follow the action or escalation described in the source.",
            "Ignore the condition and continue without documentation.",
            "Wait indefinitely before taking any action.",
            "Use an unrelated procedure from outside the source.",
        ],
        "correct": 0,
        "explanation": fact,
        "source": conditional["label"],
        "quality": min(80, conditional["quality"]),
    }


def _group(items: list[dict], count: int) -> list[list[dict]]:
    if not items:
        return []
    size = max(1, math.ceil(len(items) / count))
    return [items[index : index + size] for index in range(0, len(items), size)]


def _truncate(text: str, limit: int) -> str:
    clean = re.sub(r"\s+", " ", text).strip()
    if len(clean) <= limit:
        return clean
    return clean[: limit - 1].rsplit(" ", 1)[0] + "…"


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
