# Skola Codebase Understanding

## Overview
Skola is a web-based spaced repetition flashcard app (similar to Anki) built with:
- **TypeScript + React**
- **Mantine UI** components
- **Dexie.js** (IndexedDB) for local storage
- **FSRS.js** for spaced repetition scheduling
- **TipTap** for rich text editing

## Architecture

### Core Concepts

1. **Notes** (`Note<T>`) - The source content/data
   - Each note has a `content` field of type `NoteContent<T>`
   - Notes belong to a `deck`
   - Notes have a `sortField` for ordering

2. **Cards** (`Card<T>`) - Individual reviewable items generated from notes
   - Cards reference a `note`
   - Cards have their own `content` of type `Content<T>` (card-specific data)
   - Cards have FSRS scheduling state (`model`)
   - Cards have review `history`

3. **Note Types** (`NoteType` enum)
   - `Basic` - Simple front/back cards
   - `Cloze` - Cloze deletion cards
   - `DoubleSided` - Two fields that can be front or back
   - `ImageOcclusion` - Image-based cards (not fully implemented)
   - `Undefined` - Fallback type

### Type System Pattern

The codebase uses TypeScript discriminated unions:

```typescript
// Note content is a union based on NoteType
type NoteContent<T extends NoteType> = {
  type: T;
} & (T extends NoteType.Basic ? NormalNoteContent : {}) &
  (T extends NoteType.Cloze ? ClozeNoteContent : {}) &
  // ... etc

// Card content is similar
type Content<T extends NoteType> = {
  type: T;
} & (T extends NoteType.Basic ? NormalCardContent : {}) &
  // ... etc
```

### NoteTypeAdapter Pattern

Each note type has a `NoteTypeAdapter<T>` that implements:
- `createNote(params, deck)` - Creates a new note and card
- `updateNote(params, existingNote)` - Updates note content
- `displayQuestion(card, content)` - Renders the question side
- `displayAnswer(card, content)` - Renders the answer side
- `displayNote(note, showAllAnswers)` - Renders note in notebook view
- `getSortFieldFromNoteContent(content)` - Extracts sort field
- `editor(props)` - Returns the editor component
- `deleteCard(card)` - Handles card deletion

### Learning Flow

1. **LearnView** (`src/app/learn/LearnView/LearnView.tsx`)
   - Uses `useLearning()` hook to manage card queue
   - Shows question via `adapter.displayQuestion()`
   - User clicks "Show Answer"
   - Shows answer via `adapter.displayAnswer()`
   - User rates with Again/Hard/Good/Easy buttons
   - FSRS scheduling updates the card

2. **useLearning Hook** (`src/logic/learn.ts`)
   - Manages card queues: `newCards`, `toReviewCards`, `timeCriticalCards`, `learnedCards`
   - Handles card selection based on `newToReviewRatio`
   - Updates card model via `updateCardModel()` when answered
   - Tracks statistics

3. **Card Scheduling**
   - Uses FSRS.js library
   - Cards have `model` with `state` (New, Learning, Review, Relearning)
   - `Rating` enum: Again(1), Hard(2), Good(3), Easy(4)
   - `scheduler.repeat()` calculates next review date for each rating

### Editor Flow

1. **NoteEditor** (`src/app/editor/NoteEditor/NoteEditor.tsx`)
   - Main editor component that routes to type-specific editors
   - Uses `getAdapter()` to get the adapter
   - Calls `adapter.editor()` to render type-specific editor

2. **Type-Specific Editors**
   - `NormalCardEditor` - Two rich text fields (front/back)
   - `DoubleSidedCardEditor` - Two fields + toggle for which is front
   - `ClozeCardEditor` - Single field with cloze syntax
   - Each editor uses TipTap `RichTextEditor` components

### Database Schema

```typescript
class Database extends Dexie {
  decks!: Table<Deck>;
  cards!: Table<Card<NoteType>>;
  notes!: Table<Note<NoteType>>;
  statistics!: Table<DeckStatistics>;
  settings!: Table<Settings>;
}
```

### File Structure

```
src/
├── logic/
│   ├── card/          # Card operations
│   ├── deck/          # Deck operations
│   ├── note/          # Note operations
│   ├── type-implementations/  # Note type adapters
│   │   ├── normal/
│   │   ├── cloze/
│   │   ├── double-sided/
│   │   └── ...
│   ├── NoteTypeAdapter.tsx  # Adapter interface
│   └── learn.ts       # Learning logic
├── app/
│   ├── learn/         # Learning UI
│   ├── editor/        # Note/card editing UI
│   └── ...
└── components/        # Reusable components
```

## Key Patterns

1. **Adapter Pattern** - Each note type has its own adapter implementing `NoteTypeAdapter<T>`
2. **Type Safety** - Heavy use of TypeScript generics and discriminated unions
3. **Transaction Safety** - Database operations wrapped in Dexie transactions
4. **Rich Text** - TipTap editor for HTML content (stored as HTML strings)
5. **FSRS Integration** - All cards use FSRS for scheduling, ratings map to FSRS ratings

## Adding a New Card Type

To add a new card type (e.g., "List"):

1. Add `List = "list"` to `NoteType` enum
2. Define `ListNoteContent` and `ListCardContent` types
3. Update `NoteContent<T>` and `Content<T>` type unions
4. Create `ListNoteTypeAdapter` implementing all adapter methods
5. Create `ListCardEditor` component
6. Create display components for question/answer
7. Register adapter in `getAdapterOfType()`
8. Add translation keys for UI labels
9. Implement grading logic (if needed for interactive cards)
