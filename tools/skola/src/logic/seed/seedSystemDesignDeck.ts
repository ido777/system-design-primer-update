import { getAdapterOfType } from "@/logic/NoteTypeAdapter";
import { db } from "@/logic/db";
import { newDeck } from "@/logic/deck/newDeck";
import { NoteType } from "@/logic/note/note";
import { getDeck } from "@/logic/deck/getDeck";

interface DeckJson {
  meta: {
    id: string;
    title: string;
    version: number;
    description: string;
    license: string;
    created_at: string;
    tags: string[];
  };
  decks: Array<{
    deck_id: string;
    name: string;
    description: string;
    tags: string[];
    cards: Array<{
      id: string;
      type: "basic" | "cloze";
      prompt?: string;
      answer?: string;
      text?: string;
      blanks?: Record<string, string>;
      tags?: string[];
    }>;
  }>;
}

const SEEDED_DECK_MARKER = "system-design.v1";
const SEEDING_LOCK_KEY = "skola_seeding_lock";

/**
 * Checks if the system design deck has already been seeded
 */
async function isAlreadySeeded(): Promise<boolean> {
  // Check if seeding is in progress (to prevent concurrent seeding)
  if (sessionStorage.getItem(SEEDING_LOCK_KEY) === "true") {
    return true;
  }

  const allDecks = await db.decks.toArray();
  // Check if any deck has the seeded marker in its description
  const seeded = allDecks.some(
    (deck) => deck.description?.includes(SEEDED_DECK_MARKER)
  );
  
  return seeded;
}

/**
 * Converts a cloze card with blanks object to Skola's cloze format
 */
function convertClozeText(text: string, blanks: Record<string, string>): string {
  let result = text;
  let occlusionNumber = 1;
  
  // Sort blanks by their key to ensure consistent ordering
  const sortedBlanks = Object.entries(blanks).sort(([a], [b]) => 
    a.localeCompare(b)
  );
  
  for (const [key, value] of sortedBlanks) {
    const clozeFormat = `{{c${occlusionNumber}::${value}}}`;
    // Replace all occurrences of the placeholder [key]
    result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), clozeFormat);
    occlusionNumber++;
  }
  
  return result;
}

/**
 * Seeds the system design deck from the JSON file
 */
export async function seedSystemDesignDeck(): Promise<void> {
  try {
    // Check if already seeded
    if (await isAlreadySeeded()) {
      console.log("System design deck already seeded, skipping...");
      return;
    }

    // Set lock to prevent concurrent seeding (e.g., from React StrictMode)
    sessionStorage.setItem(SEEDING_LOCK_KEY, "true");

    // Fetch the deck JSON
    const response = await fetch("/decks/system-design.v1.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch deck: ${response.statusText}`);
    }

    const deckData: DeckJson = await response.json();

    // Create decks and cards
    for (const deckJson of deckData.decks) {
      // Check if this specific deck already exists by name (additional safety check)
      const existingDecks = await db.decks.toArray();
      const deckExists = existingDecks.some(
        (deck) => deck.name === deckJson.name && deck.description?.includes(SEEDED_DECK_MARKER)
      );
      
      if (deckExists) {
        console.log(`Deck "${deckJson.name}" already exists, skipping...`);
        continue;
      }

      // Create the deck with description that includes the marker
      const deckId = await newDeck(
        deckJson.name,
        undefined,
        `${deckJson.description}\n\n[${SEEDED_DECK_MARKER}]`
      );

      const deck = await getDeck(deckId);
      if (!deck) {
        throw new Error(`Failed to create deck: ${deckJson.name}`);
      }

      // Create notes and cards for each card in the deck
      for (const cardJson of deckJson.cards) {
        if (cardJson.type === "basic") {
          // Create basic card
          if (cardJson.prompt && cardJson.answer) {
            await getAdapterOfType(NoteType.Basic).createNote(
              {
                front: cardJson.prompt,
                back: cardJson.answer,
              },
              deck
            );
          }
        } else if (cardJson.type === "cloze") {
          // Create cloze card
          if (cardJson.text && cardJson.blanks) {
            const clozeText = convertClozeText(cardJson.text, cardJson.blanks);
            // Extract occlusion numbers from the converted text
            const occlusionMatches = clozeText.matchAll(/\{\{c(\d+)::/g);
            const occlusionNumbers = Array.from(occlusionMatches, (match) =>
              parseInt(match[1], 10)
            );
            
            await getAdapterOfType(NoteType.Cloze).createNote(
              {
                text: clozeText,
                occlusionNumberSet: occlusionNumbers,
              },
              deck
            );
          }
        }
      }
    }

    console.log("Successfully seeded system design deck");
    // Clear the lock after successful seeding
    sessionStorage.removeItem(SEEDING_LOCK_KEY);
  } catch (error) {
    console.error("Error seeding system design deck:", error);
    // Clear the lock on error so it can be retried
    sessionStorage.removeItem(SEEDING_LOCK_KEY);
    // Don't throw - we don't want to break the app if seeding fails
  }
}
