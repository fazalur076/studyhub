/**
 * Get random element from array
 */
export const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Check if object is empty
 */
export const isEmptyObject = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Remove duplicates from array
 */
export const uniqueArray = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

// Open-answer evaluation helpers (for SAQ/LAQ)

const STOPWORDS = new Set([
  'a','an','the','and','or','but','if','then','else','when','at','by','for','in','of','on','to','with','as','is','are','was','were','be','been','being','it','its','that','this','these','those','from','which','who','whom','what','why','how'
]);

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const tokenize = (text: string): string[] => {
  return normalizeText(text)
    .split(' ')
    .filter(token => token.length > 1 && !STOPWORDS.has(token));
};

const uniqueTokens = (tokens: string[]): string[] => Array.from(new Set(tokens));

const jaccardSimilarity = (aTokens: string[], bTokens: string[]): number => {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
};

const keywordSetFromAnswer = (correctAnswer: string, explanation?: string): string[] => {
  const base = tokenize(correctAnswer);
  const extra = explanation ? tokenize(explanation) : [];
  const freq: Record<string, number> = {};
  for (const t of extra) freq[t] = (freq[t] || 0) + 1;
  const extraSorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([t]) => t);
  return uniqueTokens([...base, ...extraSorted]).slice(0, 24);
};

export const evaluateOpenAnswer = (
  userAnswer: string,
  correctAnswer: string,
  explanation?: string
): { isCorrect: boolean; similarity: number } => {
  const userTokens = uniqueTokens(tokenize(userAnswer));
  const keyTokens = uniqueTokens(keywordSetFromAnswer(correctAnswer, explanation));

  // If user explicitly mentions most of the key terms, consider correct
  const overlap = userTokens.filter(t => keyTokens.includes(t)).length;
  const precision = keyTokens.length === 0 ? 0 : overlap / keyTokens.length;
  const recall = userTokens.length === 0 ? 0 : overlap / userTokens.length;
  const jaccard = jaccardSimilarity(userTokens, keyTokens);

  const combined = (precision * 0.4) + (recall * 0.2) + (jaccard * 0.4);

  const isCorrect = combined >= 0.38 || (precision >= 0.5 && jaccard >= 0.3);

  return { isCorrect, similarity: Number(combined.toFixed(3)) };
};