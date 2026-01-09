import { db } from "../db";

/**
 * Resets the entire Skola database by deleting it.
 * This will clear all decks, cards, notes, settings, and statistics.
 * 
 * Note: After calling this, you should reload the page for the changes to take effect.
 */
export async function resetDatabase(): Promise<void> {
  await db.delete();
  console.log("Database reset complete. Please reload the page.");
}
