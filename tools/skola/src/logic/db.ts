import Dexie, { Table } from "dexie";
import "dexie-export-import";
import dexieCloud from "dexie-cloud-addon";
import { Card } from "./card/card";
import { Deck } from "./deck/deck";
import { NoteType } from "./note/note";
import { Note } from "./note/note";
import { Settings, SettingsValues } from "./settings/Settings";
import { DeckStatistics } from "./statistics";

export class Database extends Dexie {
  decks!: Table<Deck>;
  cards!: Table<Card<NoteType>>;
  notes!: Table<Note<NoteType>>;
  statistics!: Table<DeckStatistics>;
  settings!: Table<Settings<keyof SettingsValues>>;

  constructor() {
    super("skola_db", { addons: [dexieCloud], cache: "disabled" });
    this.version(16).stores({
      cards: "id, note, deck",
      decks: "id, *cards, *notes, *subDecks, *superDecks",
      notes: "id, deck, sortField",
      statistics: "[deck+day], day",
      settings: "key",
    });
    this.open();
  }
}

export const db = new Database();

// Configure Dexie Cloud only if enabled and not in a restricted environment
// This prevents CORS errors on GitHub Pages where cloud sync isn't configured
const enableDexieCloud = import.meta.env.VITE_ENABLE_DEXIE_CLOUD !== "false";
const databaseUrl = import.meta.env.VITE_DEXIE_CLOUD_URL || "https://zj33i18c8.dexie.cloud";

if (enableDexieCloud && databaseUrl) {
  try {
    db.cloud.configure({
      databaseUrl: databaseUrl,
      tryUseServiceWorker: true,
      customLoginGui: true,
    });
  } catch (error) {
    // Gracefully handle configuration errors (e.g., CORS issues)
    console.warn("Dexie Cloud configuration failed, continuing without cloud sync:", error);
  }
} else {
  console.log("Dexie Cloud is disabled. Data will be stored locally only.");
}
