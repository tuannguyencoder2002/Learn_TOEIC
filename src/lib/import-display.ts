import type { ParsedQuestionInput } from "@/lib/repositories/questions";

export interface ImportQuestionDisplay {
  questionNumber: number;
  sentenceComplete: string;
  sentenceVi?: string;
  correctWord: string;
  wordType?: string;
  meaningVi?: string;
  grammarHintVi: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export function buildGrammarLine(q: {
  grammarHintVi?: string;
  correctWord?: string;
  meaningVi?: string;
  explanationVi?: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}): string {
  if (q.grammarHintVi && q.correctWord) {
    const word = q.correctWord;
    const meaning = q.meaningVi ? ` (${q.meaningVi})` : "";
    return `${q.grammarHintVi}. ${word}${meaning}`;
  }
  return q.explanationVi ?? q.grammarHintVi ?? "";
}

export function toImportDisplay(
  q: ParsedQuestionInput,
  fallbackIndex: number
): ImportQuestionDisplay {
  const correctWord = q.correctWord ?? q.options[q.correctIndex];
  const sentenceComplete =
    q.sentenceComplete ??
    (q.explanation?.trim() || q.sentence.replace(/_{2,}/g, correctWord));

  return {
    questionNumber: q.questionNumber ?? fallbackIndex + 1,
    sentenceComplete,
    sentenceVi: q.sentenceVi,
    correctWord,
    wordType: q.wordType,
    meaningVi: q.meaningVi,
    grammarHintVi: buildGrammarLine(q),
    options: q.options,
    correctIndex: q.correctIndex,
  };
}

export function highlightWord(sentence: string, word: string): { before: string; match: string; after: string } {
  const idx = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) {
    return { before: sentence, match: "", after: "" };
  }
  return {
    before: sentence.slice(0, idx),
    match: sentence.slice(idx, idx + word.length),
    after: sentence.slice(idx + word.length),
  };
}

export function normalizeParsedQuestion(q: ParsedQuestionInput): ParsedQuestionInput {
  const correctWord = q.correctWord ?? q.options[q.correctIndex];
  const grammarLine = buildGrammarLine({ ...q, correctWord });

  return {
    ...q,
    correctWord,
    sentenceComplete:
      q.sentenceComplete ??
      (q.explanation?.trim() || q.sentence.replace(/_{2,}/g, correctWord)),
    explanation: q.sentenceComplete ?? q.explanation ?? q.sentence.replace(/_{2,}/g, correctWord),
    explanationVi: grammarLine || q.explanationVi,
  };
}
