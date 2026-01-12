# Accessing Skola Database Manually

Skola uses **IndexedDB** (via Dexie.js) to store all data locally in your browser.

## Browser DevTools Access

### Chrome/Edge/Brave
1. Open DevTools (F12 or Right-click → Inspect)
2. Go to **Application** tab (or **Storage** in older versions)
3. Expand **IndexedDB** in the left sidebar
4. Find **skola_db**
5. Expand to see tables: `decks`, `cards`, `notes`, `statistics`, `settings`

### Firefox
1. Open DevTools (F12)
2. Go to **Storage** tab
3. Expand **IndexedDB**
4. Find **skola_db**
5. Expand to see tables

### Safari
1. Open DevTools (Cmd+Option+I)
2. Go to **Storage** tab
3. Expand **IndexedDB**
4. Find **skola_db**

## Viewing Seeding Markers

Seeding markers are stored in the `decks` table, in the `description` field:

1. Open `decks` table
2. Look for `description` field
3. Seeding markers look like: `[system-design.v2]` or `[system-design.v1]`
4. You may also see `deck_id:sd_foundations` lines

## Manual Database Operations

### Using Browser Console

You can run JavaScript in the browser console to interact with the database:

```javascript
// Import the database (if available in global scope)
// Or use Dexie directly:

// 1. View all decks
const db = await import('/src/logic/db.ts'); // Adjust path as needed
// Or access via window if exposed

// 2. View decks with seeding markers
const allDecks = await db.decks.toArray();
const seededDecks = allDecks.filter(d => d.description?.includes('['));
console.table(seededDecks.map(d => ({
  id: d.id,
  name: d.name,
  description: d.description
})));

// 3. Remove seeding marker from a specific deck
await db.decks.update('deck-id-here', {
  description: deck.description.replace(/\[[^\]]+\]/g, '').trim()
});

// 4. Remove all seeding markers
const allDecks = await db.decks.toArray();
for (const deck of allDecks) {
  if (deck.description) {
    const cleaned = deck.description
      .replace(/\[[^\]]+\]/g, '')
      .replace(/deck_id:[^\n]+\n?/g, '')
      .trim();
    await db.decks.update(deck.id, { description: cleaned });
  }
}
```

### Using the App's Built-in Functions

The app now includes utility functions accessible via the browser console:

```javascript
// Reset seeding for a specific file
await window.resetSeedingState('system-design.v2');

// Reset all seeding markers
await window.resetAllSeedingState();
```

(Note: These functions need to be exposed to `window` - see code for implementation)

## Using the Settings UI

The easiest way is to use the built-in UI:

1. Go to **Settings** → **Database**
2. Click **Reset Seeding State** button
3. Confirm the action
4. The app will reload and allow re-seeding

## Understanding Seeding Markers

Seeding markers are stored in deck descriptions like this:

```
Your deck description here

[system-design.v2]
deck_id:sd_foundations
```

- `[system-design.v2]` - The `meta.id` from the deck file
- `deck_id:sd_foundations` - The unique deck identifier from the file

When you delete a deck, it's completely removed from the database, so the marker is gone. However, if you manually edit a deck's description or if there's a bug, markers might persist.

## Troubleshooting

### "Deck already seeded" but deck doesn't exist

1. Check if any decks have the marker in their description
2. Use "Reset Seeding State" button in Settings
3. Or manually remove markers using console commands above

### Want to re-seed a specific file

1. Use `resetSeedingState('meta-id-here')` function
2. Or manually edit deck descriptions to remove the marker
3. Reload the app

### Clear everything and start fresh

1. Use "Delete all Data" button in Settings
2. Or manually delete the IndexedDB database:
   - DevTools → Application → IndexedDB → skola_db → Delete

## Database Schema

- **decks**: Contains deck metadata, including `description` field with seeding markers
- **cards**: Individual flash cards
- **notes**: Source content for cards
- **statistics**: Learning statistics
- **settings**: App settings

The seeding system only reads from the `decks` table to check if files have been seeded.
