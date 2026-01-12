# Browser Storage in Skola - Technical Explanation

## Overview

Skola uses **IndexedDB** (via **Dexie.js**) to store all application data directly in the user's browser. This means:
- **No backend server required** - all data lives locally
- **Works offline** - once loaded, the app functions without internet
- **Private by default** - data never leaves the user's device unless they explicitly sync

## Core Technologies

### 1. IndexedDB
**IndexedDB** is a low-level browser API that provides:
- **Persistent storage** - survives browser restarts
- **Large capacity** - can store gigabytes of data
- **Structured data** - stores JavaScript objects, not just strings
- **Indexed queries** - fast lookups by keys or indexes
- **Asynchronous** - non-blocking operations

**Key Concepts:**
- **Database**: A container for object stores (like a database in SQL)
- **Object Store**: A collection of objects (like a table in SQL)
- **Index**: A way to query objects by properties other than the primary key
- **Transaction**: Ensures data consistency (all-or-nothing operations)

### 2. Dexie.js
**Dexie** is a wrapper library that makes IndexedDB easier to use:
- **Promise-based API** - cleaner than IndexedDB's callback-based API
- **TypeScript support** - type-safe database operations
- **Query builder** - chainable methods like `.where()`, `.filter()`, `.sort()`
- **Schema management** - version migrations handled automatically

**Example from Skola:**
```typescript
// Database schema definition
export class Database extends Dexie {
  decks!: Table<Deck>;
  cards!: Table<Card>;
  notes!: Table<Note>;
  
  constructor() {
    super("skola_db");
    this.version(16).stores({
      decks: "id, *cards, *notes",
      cards: "id, note, deck",
      notes: "id, deck, sortField"
    });
  }
}
```

### 3. Dexie Cloud (Optional Sync)
**Dexie Cloud** is an optional addon that enables:
- **Cloud sync** - backup data to a remote server
- **Multi-device** - access same data from different devices
- **Collaboration** - share data between users

**Important:** This requires:
- A Dexie Cloud account and database URL
- CORS configuration on the cloud server
- User authentication

## How Data Flows in Skola

### Storage Location
- **Browser**: IndexedDB database named `skola_db`
- **Location**: Browser-specific storage (Chrome: `chrome://settings/content/all`)
- **Persistence**: Can be made "persistent" (won't be cleared automatically)

### Data Structure
```
skola_db (Database)
├── decks (Object Store)
│   └── Stores: Deck objects with id, name, description, etc.
├── cards (Object Store)
│   └── Stores: Card objects linked to notes and decks
├── notes (Object Store)
│   └── Stores: Note objects (basic/cloze) with content
├── statistics (Object Store)
│   └── Stores: Learning statistics per deck/day
└── settings (Object Store)
    └── Stores: User preferences (theme, language, etc.)
```

### Operations

**Reading Data:**
```typescript
// Get all decks
const decks = await db.decks.toArray();

// Get a specific deck
const deck = await db.decks.get(deckId);

// Query with filters
const cards = await db.cards.where('deck').equals(deckId).toArray();
```

**Writing Data:**
```typescript
// Add a new deck
await db.decks.add({
  id: 'deck-123',
  name: 'My Deck',
  cards: [],
  notes: []
});

// Update existing
await db.decks.update(deckId, { name: 'Updated Name' });

// Delete
await db.decks.delete(deckId);
```

## Storage Persistence

### Making Storage Persistent
Skola attempts to make storage "persistent" (won't be auto-cleared):

```typescript
// Check if storage is persistent
const isPersistent = await navigator.storage.persist();

// Request persistent storage
const granted = await navigator.storage.persist();
```

**Browser Behavior:**
- **Chrome/Edge**: Usually grants persistent storage
- **Firefox**: Usually grants persistent storage
- **Safari**: May clear after 7 days of inactivity (iOS limitation)

### Storage Quotas
- **Typical limit**: 50-60% of available disk space
- **Minimum**: Usually several GB
- **Skola usage**: Typically < 100MB for thousands of cards

## Advantages of Browser Storage

1. **Privacy**: Data never leaves user's device (unless syncing)
2. **Performance**: Instant access, no network latency
3. **Offline-first**: Works without internet connection
4. **Cost**: No server costs for storage
5. **Simplicity**: No backend infrastructure needed

## Limitations

1. **Browser-specific**: Data tied to specific browser/device
2. **No built-in backup**: User must export manually or use sync
3. **Storage limits**: Subject to browser quotas
4. **Clearing risk**: Can be cleared by user or browser
5. **No server-side processing**: All logic runs client-side

## Import/Export

Skola supports manual backup via:
- **Export**: Downloads entire database as JSON
- **Import**: Restores from JSON file
- **Location**: Settings → Database → Export/Import

This allows users to:
- Backup their data
- Transfer between devices
- Restore after clearing browser data
