# Deck Seeding System - Explanation

## What is Seeding?

Seeding is the process of automatically importing deck files (JSON or YAML) into the Skola database when the app first loads. This allows you to pre-populate the app with content without manual data entry.

## How It Works (Before vs After)

### ❌ **Before (Problems)**

1. **Single File Only**: Only processed one hardcoded file (`system-design.v1.json`)
2. **Global Marker**: Used a single marker (`system-design.v2`) that blocked ALL seeding if ANY deck existed
3. **Not Idempotent**: If v1 was seeded, v2 would be skipped even if it had different content
4. **Name Collision**: Checked only by deck name, causing false positives

**Problems:**
- Adding `system-design.v2.yaml` wouldn't be processed
- If v1 was seeded, v2 would be skipped entirely
- Running seeding multiple times would fail unpredictably

### ✅ **After (Fixed)**

1. **Multiple Files**: Automatically discovers and processes all deck files in the `decks/` folder
2. **Per-File Markers**: Uses `meta.id` from each file as a unique identifier
3. **Idempotent**: Safe to run multiple times - only seeds files that haven't been seeded yet
4. **Smart Matching**: Uses `deck_id` + `meta.id` for precise matching

## How Idempotency Works

### 1. **File-Level Idempotency**
Each file is checked independently using its `meta.id`:
```typescript
// Check if file with meta.id "system-design.v2" has been seeded
if (await isFileAlreadySeeded("system-design.v2")) {
  // Skip this file, but continue with others
}
```

### 2. **Deck-Level Idempotency**
Within each file, decks are checked using `deck_id` + `meta.id`:
```typescript
// Check if this specific deck from this specific file exists
const deckExists = existingDecks.some(
  (deck) => {
    const hasMarker = deck.description?.includes(`[system-design.v2]`);
    const matchesId = deck.description?.includes(`deck_id:sd_foundations`);
    return hasMarker && matchesId;
  }
);
```

### 3. **Marker Format**
Decks are marked with both the file's `meta.id` and `deck_id`:
```
Description text here

[system-design.v2]
deck_id:sd_foundations
```

## File Discovery

The system tries to discover deck files automatically:

```typescript
const knownFiles = [
  "system-design.v1.json",
  "system-design.v2.yaml",
  "system-design.v2.yml",
];
```

It attempts to fetch each file (using HEAD request) and only processes files that exist.

**Note**: In a browser environment, we can't list directory contents directly. The system uses a known-files list. For production, consider maintaining a `manifest.json` file.

## Usage

### Automatic (Default)
```typescript
// In App.tsx - processes all discovered files
seedSystemDesignDeck();
```

### Manual (Specific Files)
```typescript
// Process only specific files
seedSystemDesignDeck([
  "system-design.v1.json",
  "system-design.v2.yaml"
]);
```

## Benefits

1. **✅ Idempotent**: Run multiple times safely - won't create duplicates
2. **✅ Multiple Files**: Process all deck files, not just one
3. **✅ Independent**: Each file is processed independently
4. **✅ Version Safe**: Different versions (v1, v2) can coexist
5. **✅ Format Agnostic**: Supports both JSON and YAML
6. **✅ Error Resilient**: If one file fails, others still process

## Example Scenario

1. **First Run**: 
   - Discovers `system-design.v1.json` and `system-design.v2.yaml`
   - Seeds both files
   - Creates decks with markers `[system-design.v1]` and `[system-design.v2]`

2. **Second Run** (e.g., page refresh):
   - Discovers same files
   - Checks markers: both files already seeded
   - Skips both (idempotent!)

3. **Add New File** (`system-design.v3.yaml`):
   - Discovers all three files
   - v1 and v2: already seeded, skipped
   - v3: new file, seeds it

4. **Update Existing File**:
   - If you change `meta.id`, it's treated as a new file
   - If you keep same `meta.id` but change content, it won't re-seed (by design - prevents duplicates)

## Why This Design?

- **Idempotency**: Critical for web apps - users refresh, navigate, etc. Seeding should be safe to run anytime.
- **Per-File Tracking**: Allows multiple versions/editions to coexist
- **Deck-Level Tracking**: Prevents duplicate decks even if file is re-processed
- **Error Handling**: One bad file doesn't break the entire seeding process
