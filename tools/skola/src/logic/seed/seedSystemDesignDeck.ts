import { getAdapterOfType } from "@/logic/NoteTypeAdapter";
import { db } from "@/logic/db";
import { newDeck } from "@/logic/deck/newDeck";
import { NoteType } from "@/logic/note/note";
import { getDeck } from "@/logic/deck/getDeck";
import yaml from "js-yaml";

/**
 * Deck data structure (supports both JSON and YAML formats)
 */
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
      type: "basic" | "cloze" | "list";
      prompt?: string;
      answer?: string;
      text?: string;
      blanks?: Record<string, string>;
      items?: Array<{
        text: string;
        aliases?: string[];
      }>;
      order?: "unordered" | "ordered";
      tags?: string[];
    }>;
  }>;
}

const SEEDING_LOCK_KEY = "skola_seeding_lock";

/**
 * Resets the seeding state for a specific meta.id
 * This removes the seeding marker from all decks, allowing re-seeding
 * @param metaId The meta.id to reset (e.g., "system-design.v2")
 */
export async function resetSeedingState(metaId: string): Promise<void> {
  const allDecks = await db.decks.toArray();
  const marker = `[${metaId}]`;
  
  const decksToUpdate = allDecks.filter(
    (deck) => deck.description?.includes(marker)
  );
  
  for (const deck of decksToUpdate) {
    // Remove the marker from description
    const newDescription = deck.description
      ?.replace(new RegExp(`\\[${metaId}\\][\\s\\S]*?(?=\\[|$)`, "g"), "")
      .replace(/deck_id:[^\n]+\n?/g, "")
      .trim();
    
    await db.decks.update(deck.id, {
      description: newDescription || deck.description?.replace(marker, "").trim(),
    });
  }
  
  console.log(`Reset seeding state for ${metaId}. Updated ${decksToUpdate.length} deck(s).`);
}

/**
 * Resets seeding state for all deck files
 * Useful for clearing all seeding markers
 */
export async function resetAllSeedingState(): Promise<void> {
  const allDecks = await db.decks.toArray();
  let updatedCount = 0;
  
  for (const deck of allDecks) {
    if (deck.description) {
      // Remove all seeding markers (format: [meta.id])
      const cleaned = deck.description
        .replace(/\[[^\]]+\]/g, "") // Remove [meta.id] markers
        .replace(/deck_id:[^\n]+\n?/g, "") // Remove deck_id lines
        .trim();
      
      if (cleaned !== deck.description) {
        await db.decks.update(deck.id, { description: cleaned });
        updatedCount++;
      }
    }
  }
  
  console.log(`Reset seeding state for all decks. Updated ${updatedCount} deck(s).`);
}

/**
 * Checks if a specific deck file (by meta.id) has already been seeded
 * Uses the meta.id from the file as a unique marker
 * Returns true only if at least one deck with this marker exists AND has cards
 */
async function isFileAlreadySeeded(metaId: string): Promise<boolean> {
  // Check if seeding is in progress (to prevent concurrent seeding)
  if (sessionStorage.getItem(SEEDING_LOCK_KEY) === "true") {
    return false;
  }

  const allDecks = await db.decks.toArray();
  
  // Check if any deck has this specific meta.id in its description
  const decksWithMarker = allDecks.filter(
    (deck) => deck.description?.includes(`[${metaId}]`)
  );
  
  if (decksWithMarker.length === 0) {
    return false; // No decks with this marker exist
  }
  
  // Verify that at least one deck has cards (more robust check)
  for (const deck of decksWithMarker) {
    const cards = await db.cards.where("deck").equals(deck.id).count();
    if (cards > 0) {
      return true; // Found a deck with this marker that has cards
    }
  }
  
  // Decks exist but have no cards - might have been cleared, allow re-seeding
  console.log(`Found decks with marker [${metaId}] but they have no cards. Will re-seed.`);
  return false;
}

/**
 * Gets a list of all deck files from manifest.json
 * Falls back to trying known files if manifest doesn't exist
 */
async function getDeckFiles(): Promise<string[]> {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const decksPath = `${baseUrl}decks/`.replace(/\/+/g, "/");
  
  // Try to load manifest.json first
  try {
    const manifestResponse = await fetch(`${decksPath}manifest.json`);
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      if (manifest.files && Array.isArray(manifest.files)) {
        console.log(`Loaded ${manifest.files.length} deck files from manifest.json`);
        return manifest.files;
      }
    }
  } catch (error) {
    console.warn("Could not load manifest.json, falling back to known files:", error);
  }
  
  // Fallback: try known files (for backward compatibility)
  const knownFiles = [
    "system-design.v1.json",
    "system-design.v2.yaml",
  ];
  
  const existingFiles: string[] = [];
  
  // Try to fetch each file to see if it exists
  for (const file of knownFiles) {
    try {
      const response = await fetch(`${decksPath}${file}`, { method: "HEAD" });
      if (response.ok) {
        existingFiles.push(file);
      }
    } catch {
      // File doesn't exist or can't be accessed, skip it
      continue;
    }
  }
  
  return existingFiles;
}

/**
 * Converts plain text with newlines to HTML format
 * Preserves multiline strings by converting \n to <br> tags
 * Handles both plain text and existing HTML content
 */
/**
 * Converts markdown-style formatting and newlines to HTML
 * - **text** → <b>text</b> (bold)
 * - *text* → <i>text</i> (italic, but not if part of **text**)
 * - \n → <br> (newlines)
 * Also escapes HTML entities if the text doesn't already contain HTML tags
 */
function convertNewlinesToHtml(text: string): string {
  if (!text) return text;
  
  // If text already contains HTML tags, preserve them and only convert markdown/newlines
  const hasHtmlTags = /<[^>]+>/.test(text);
  
  let processed = text;
  
  // Convert markdown formatting to HTML
  // First handle bold (**text**), then italic (*text*)
  // Use a regex that doesn't match * that's part of **
  
  // Convert **text** to <b>text</b> first
  // This handles bold text, including cases like **C**ore, **B**usiness, **A**ctors
  processed = processed.replace(/\*\*([^*]+?)\*\*/g, "<b>$1</b>");
  
  // Then convert *text* to <i>text</i> (but not if it's part of **text** which we already converted)
  // This regex matches *text* that's not preceded or followed by *
  // Note: lookbehind (?<!\*) ensures we don't match * that's part of **
  processed = processed.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "<i>$1</i>");
  
  // Convert newlines to <br> tags
  processed = processed.replace(/\n/g, "<br>");
  
  if (hasHtmlTags) {
    // Text already contains HTML - return as is (markdown and newlines already converted)
    return processed;
  } else {
    // Plain text - escape HTML entities, but preserve the tags we just inserted
    // Use placeholder approach: temporarily replace our tags, escape, then restore
    
    const tagPlaceholders: Array<{ placeholder: string; tag: string }> = [];
    let placeholderIndex = 0;
    
    // Find all our inserted tags
    const tagPattern = /<(b|i)>(.*?)<\/\1>/g;
    const matches: Array<{ full: string; start: number; end: number }> = [];
    let match;
    
    // Collect all matches with their positions
    while ((match = tagPattern.exec(processed)) !== null) {
      matches.push({
        full: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    
    // Replace from end to start to preserve string indices
    let tempProcessed = processed;
    for (let i = matches.length - 1; i >= 0; i--) {
      const placeholder = `__TAG_PLACEHOLDER_${placeholderIndex}__`;
      tagPlaceholders.push({ placeholder, tag: matches[i].full });
      tempProcessed =
        tempProcessed.substring(0, matches[i].start) +
        placeholder +
        tempProcessed.substring(matches[i].end);
      placeholderIndex++;
    }
    
    // Now escape HTML entities
    let escaped = tempProcessed
      .replace(/&(?!amp;|lt;|gt;|quot;|#)/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Restore our tags (in reverse order to preserve indices)
    for (let i = tagPlaceholders.length - 1; i >= 0; i--) {
      escaped = escaped.replace(tagPlaceholders[i].placeholder, tagPlaceholders[i].tag);
    }
    
    return escaped;
  }
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
 * Checks if content is HTML (likely an error page)
 */
function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith("<!DOCTYPE") || 
         trimmed.startsWith("<html") || 
         trimmed.startsWith("<script");
}

/**
 * Parses deck data from JSON or YAML format
 */
function parseDeckData(content: string, filePath: string): DeckJson {
  // Check if we got HTML instead of deck data (404 page, error page, etc.)
  if (isHtmlContent(content)) {
    throw new Error(`Received HTML instead of deck data. File may not exist or server returned an error page.`);
  }
  
  const extension = filePath.toLowerCase().split(".").pop();
  
  if (extension === "yaml" || extension === "yml") {
    try {
      return yaml.load(content) as DeckJson;
    } catch (error) {
      throw new Error(`Failed to parse YAML file: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else if (extension === "json") {
    try {
      return JSON.parse(content) as DeckJson;
    } catch (error) {
      throw new Error(`Failed to parse JSON file: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // Try JSON first, then YAML as fallback
    try {
      return JSON.parse(content) as DeckJson;
    } catch {
      try {
        return yaml.load(content) as DeckJson;
      } catch (error) {
        throw new Error(`Failed to parse file as JSON or YAML: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}

/**
 * Seeds a single deck file (idempotent - safe to call multiple times)
 */
async function seedDeckFile(filePath: string): Promise<void> {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const deckPath = `${baseUrl}${filePath}`.replace(/\/+/g, "/");
  
  try {
    const response = await fetch(deckPath);
    if (!response.ok) {
      console.warn(`Deck file not found or inaccessible: ${filePath} (${response.status} ${response.statusText})`);
      return;
    }

    // Check content type
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("json") && !contentType.includes("yaml") && !contentType.includes("yml") && !contentType.includes("text/plain")) {
      console.warn(`Deck file has unexpected content type: ${contentType} for ${filePath}`);
    }

    const content = await response.text();
    
    // Additional check: if content is very short or looks like HTML, skip it
    if (content.length < 50 || isHtmlContent(content)) {
      console.warn(`Deck file appears to be invalid (too short or HTML): ${filePath}`);
      return;
    }
    
    const deckData = parseDeckData(content, deckPath);
    
    // Use meta.id as the unique marker for this file
    const metaId = deckData.meta?.id || filePath;
    
    // Check if this specific file has already been seeded (idempotent check)
    if (await isFileAlreadySeeded(metaId)) {
      console.log(`Deck file "${filePath}" (${metaId}) already seeded, skipping...`);
      return;
    }

    console.log(`Seeding deck file: ${filePath} (${metaId})`);

    // Create decks and cards
    for (const deckJson of deckData.decks) {
      // Check if this specific deck already exists by deck_id + meta.id (idempotent)
      const existingDecks = await db.decks.toArray();
      const deckExists = existingDecks.some(
        (deck) => {
          const hasMarker = deck.description?.includes(`[${metaId}]`);
          // Match by deck_id if available, otherwise by name
          const matchesId = deckJson.deck_id && deck.description?.includes(`deck_id:${deckJson.deck_id}`);
          const matchesName = deck.name === deckJson.name;
          return hasMarker && (matchesId || matchesName);
        }
      );
      
      if (deckExists) {
        console.log(`Deck "${deckJson.name}" from ${metaId} already exists, skipping...`);
        continue;
      }

      // Create the deck with description that includes the unique marker
      const deckDescription = deckJson.deck_id 
        ? `${deckJson.description}\n\n[${metaId}]\ndeck_id:${deckJson.deck_id}`
        : `${deckJson.description}\n\n[${metaId}]`;
      
      const deckId = await newDeck(
        deckJson.name,
        undefined,
        deckDescription
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
                front: convertNewlinesToHtml(cardJson.prompt),
                back: convertNewlinesToHtml(cardJson.answer),
              },
              deck
            );
          }
        } else if (cardJson.type === "cloze") {
          // Create cloze card
          if (cardJson.text && cardJson.blanks) {
            // Convert newlines to HTML before processing cloze blanks
            const textWithHtml = convertNewlinesToHtml(cardJson.text);
            const clozeText = convertClozeText(textWithHtml, cardJson.blanks);
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
        } else if (cardJson.type === "list") {
          // Create list card
          if (cardJson.prompt && cardJson.items && cardJson.items.length > 0) {
            // Convert items text to HTML (preserve newlines)
            const itemsWithHtml = cardJson.items.map((item) => ({
              text: convertNewlinesToHtml(item.text),
              aliases: item.aliases?.map((alias) => convertNewlinesToHtml(alias)),
            }));
            
            await getAdapterOfType(NoteType.List).createNote(
              {
                promptHtml: convertNewlinesToHtml(cardJson.prompt),
                items: itemsWithHtml,
                order: cardJson.order || "unordered",
              },
              deck
            );
          }
        }
      }
    }

    console.log(`Successfully seeded deck file: ${filePath} (${metaId})`);
  } catch (error) {
    // Log error but don't crash - continue with other files
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error seeding deck file ${filePath}:`, errorMessage);
    // Don't throw - continue with other files
  }
}

/**
 * Seeds all deck files from the decks folder
 * This function is idempotent - safe to call multiple times.
 * It will:
 * 1. Find all deck files (.json, .yaml, .yml) in the decks folder
 * 2. Check each file's meta.id to see if it's already been seeded
 * 3. Only seed files that haven't been seeded yet
 * 4. Allow multiple files to be seeded independently
 * 
 * @param filePaths Optional array of specific file paths to seed.
 *                  If not provided, will attempt to discover files automatically.
 */
export async function seedSystemDesignDeck(filePaths?: string[]): Promise<void> {
  try {
    // Check if seeding is in progress (to prevent concurrent seeding)
    if (sessionStorage.getItem(SEEDING_LOCK_KEY) === "true") {
      console.log("Seeding already in progress, skipping...");
      return;
    }

    // Set lock to prevent concurrent seeding (e.g., from React StrictMode)
    sessionStorage.setItem(SEEDING_LOCK_KEY, "true");

    // Get list of files to seed
    const filesToSeed = filePaths || await getDeckFiles();
    
    if (filesToSeed.length === 0) {
      console.log("No deck files found to seed");
      sessionStorage.removeItem(SEEDING_LOCK_KEY);
      return;
    }

    console.log(`Found ${filesToSeed.length} deck file(s) to process:`, filesToSeed);

    // Seed each file independently (idempotent)
    for (const filePath of filesToSeed) {
      await seedDeckFile(`decks/${filePath}`);
    }

    console.log("Finished processing all deck files");
    // Clear the lock after successful seeding
    sessionStorage.removeItem(SEEDING_LOCK_KEY);
  } catch (error) {
    console.error("Error in seedSystemDesignDeck:", error);
    // Clear the lock on error so it can be retried
    sessionStorage.removeItem(SEEDING_LOCK_KEY);
    // Don't throw - we don't want to break the app if seeding fails
  }
}
