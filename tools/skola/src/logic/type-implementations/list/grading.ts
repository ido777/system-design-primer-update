import { ListCardContent } from "./types";
import { ListNoteContent } from "./types";

export interface GradingResult {
  score: number; // 0..1
  matched: string[];
  missing: string[];
  extras: string[];
  wrongPosition?: number[]; // For ordered: indices of items that are correct but in wrong position
  suggestedRating?: "Again" | "Hard" | "Good" | "Easy";
}

/**
 * Normalizes a string for comparison:
 * - trim whitespace
 * - lowercase
 * - collapse whitespace
 * - remove trailing punctuation (optional)
 */
export function normalize(
  text: string,
  mode: "basic" | "aggressive" = "basic"
): string {
  let normalized = text.trim().toLowerCase();
  // Collapse multiple whitespace into single space
  normalized = normalized.replace(/\s+/g, " ");
  if (mode === "aggressive") {
    // Remove trailing punctuation
    normalized = normalized.replace(/[.,;:!?]+$/, "");
  }
  return normalized;
}

/**
 * Parses user input into individual items (one per line)
 */
export function parseUserInput(input: string): string[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Builds a set of normalized expected items (including aliases)
 */
function buildExpectedSet(
  items: ListNoteContent["items"],
  normalizeMode: "basic" | "aggressive" = "basic"
): Set<string> {
  const expectedSet = new Set<string>();
  for (const item of items) {
    const normalized = normalize(item.text, normalizeMode);
    expectedSet.add(normalized);
    if (item.aliases) {
      for (const alias of item.aliases) {
        expectedSet.add(normalize(alias, normalizeMode));
      }
    }
  }
  return expectedSet;
}

/**
 * Builds a map from normalized text to original item text
 */
function buildNormalizedToOriginalMap(
  items: ListNoteContent["items"],
  normalizeMode: "basic" | "aggressive" = "basic"
): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of items) {
    const normalized = normalize(item.text, normalizeMode);
    if (!map.has(normalized)) {
      map.set(normalized, item.text);
    }
    if (item.aliases) {
      for (const alias of item.aliases) {
        const aliasNormalized = normalize(alias, normalizeMode);
        if (!map.has(aliasNormalized)) {
          map.set(aliasNormalized, item.text);
        }
      }
    }
  }
  return map;
}

/**
 * Grades an unordered list recall
 */
function gradeUnordered(
  expectedItems: ListNoteContent["items"],
  userItems: string[],
  normalizeMode: "basic" | "aggressive" = "basic"
): GradingResult {
  const expectedSet = buildExpectedSet(expectedItems, normalizeMode);
  const normalizedToOriginal = buildNormalizedToOriginalMap(
    expectedItems,
    normalizeMode
  );

  const matched: string[] = [];
  const matchedNormalized = new Set<string>();
  const extras: string[] = [];

  // Match user items against expected set
  for (const userItem of userItems) {
    const normalized = normalize(userItem, normalizeMode);
    if (expectedSet.has(normalized) && !matchedNormalized.has(normalized)) {
      // Found a match that hasn't been matched yet
      matchedNormalized.add(normalized);
      const original = normalizedToOriginal.get(normalized) || userItem;
      matched.push(original);
    } else {
      // Not in expected set, or already matched (duplicate)
      extras.push(userItem);
    }
  }

  // Find missing items
  const missing: string[] = [];
  for (const item of expectedItems) {
    const normalized = normalize(item.text, normalizeMode);
    if (!matchedNormalized.has(normalized)) {
      missing.push(item.text);
    }
  }

  const score = expectedItems.length > 0 ? matched.length / expectedItems.length : 0;

  return {
    score,
    matched,
    missing,
    extras,
    suggestedRating: scoreToSuggestedRating(score),
  };
}

/**
 * Grades an ordered list recall (strict position mode)
 */
function gradeOrderedStrict(
  expectedItems: ListNoteContent["items"],
  userItems: string[],
  normalizeMode: "basic" | "aggressive" = "basic"
): GradingResult {
  const expectedNormalized = expectedItems.map((item) =>
    normalize(item.text, normalizeMode)
  );

  const matched: string[] = [];
  const missing: string[] = [];
  const extras: string[] = [];
  const wrongPosition: number[] = []; // Indices in matched array that are in wrong position
  const matchedInExpected = new Set<number>(); // Expected indices that have been matched
  const correctPositions = new Set<number>(); // User input indices that are correct

  // Check each position
  for (let i = 0; i < Math.max(expectedItems.length, userItems.length); i++) {
    const expectedNorm =
      i < expectedNormalized.length ? expectedNormalized[i] : null;
    const userNormalized =
      i < userItems.length ? normalize(userItems[i], normalizeMode) : null;

    if (expectedNorm && userNormalized) {
      if (expectedNorm === userNormalized) {
        // Correct position
        matched.push(expectedItems[i].text);
        matchedInExpected.add(i);
        correctPositions.add(i);
      } else {
        // Wrong at this position - check if it's a valid item in wrong position
        const foundIndex = expectedNormalized.findIndex(
          (exp, idx) => exp === userNormalized && !matchedInExpected.has(idx)
        );
        if (foundIndex !== -1) {
          matched.push(expectedItems[foundIndex].text);
          wrongPosition.push(matched.length - 1); // Index in matched array
          matchedInExpected.add(foundIndex);
        } else {
          extras.push(userItems[i]);
        }
      }
    } else if (expectedNorm && !userNormalized) {
      // Missing item at position i - will be added to missing later if not matched
    } else if (!expectedNorm && userNormalized) {
      // Extra item
      extras.push(userItems[i]);
    }
  }

  // Find remaining missing items
  for (let i = 0; i < expectedItems.length; i++) {
    if (!matchedInExpected.has(i)) {
      missing.push(expectedItems[i].text);
    }
  }

  // Score is based on items in correct position only
  const correctPositionCount = correctPositions.size;
  const score =
    expectedItems.length > 0 ? correctPositionCount / expectedItems.length : 0;

  return {
    score,
    matched,
    missing,
    extras,
    wrongPosition,
    suggestedRating: scoreToSuggestedRating(score),
  };
}

/**
 * Maps a score (0..1) to a suggested FSRS rating
 */
function scoreToSuggestedRating(
  score: number
): "Again" | "Hard" | "Good" | "Easy" {
  if (score < 0.4) return "Again";
  if (score < 0.7) return "Hard";
  if (score < 0.9) return "Good";
  return "Easy";
}

/**
 * Main grading function
 */
export function gradeListCard(
  cardContent: ListCardContent,
  noteContent: ListNoteContent,
  userInput: string
): GradingResult {
  const userItems = parseUserInput(userInput);
  const normalizeMode = cardContent.grading?.normalize || "basic";

  if (cardContent.order === "unordered") {
    return gradeUnordered(noteContent.items, userItems, normalizeMode);
  } else {
    // ordered - use strict position by default
    const orderedMode = cardContent.grading?.orderedMode || "strict-position";
    if (orderedMode === "strict-position") {
      return gradeOrderedStrict(noteContent.items, userItems, normalizeMode);
    } else {
      // LCS mode - for future implementation
      // For now, fall back to strict
      return gradeOrderedStrict(noteContent.items, userItems, normalizeMode);
    }
  }
}
