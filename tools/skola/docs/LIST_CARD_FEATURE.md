# List Recall Card Feature

## Overview

The List Recall card type allows users to practice recalling lists of items. It supports both **unordered** (order doesn't matter) and **ordered** (order matters) list recall.

## Features

### Card Types

1. **Unordered List** - User can recall items in any order
2. **Ordered List** - User must recall items in the correct order (strict position matching)

### Grading

- **Normalization**: Text is normalized (trimmed, lowercased, whitespace collapsed) before comparison
- **Aliases**: Each item can have alternative names/spellings that are also accepted
- **Score Calculation**:
  - Unordered: `matched items / total items`
  - Ordered: `items in correct position / total items`
- **Suggested Rating**: Automatically suggests FSRS rating (Again/Hard/Good/Easy) based on score

### Review Interface

1. **Question Display**: Shows the prompt (rich text HTML)
2. **Answer Input**: Textarea where user types one item per line
3. **Results Display**: After submission, shows:
   - Score summary (X/Y items, percentage)
   - ✅ Matched items (with position badges for ordered lists)
   - ❌ Missing items
   - ⚠️ Extra items (items user typed that aren't in the list)
   - Expected answer (for reference)

## How to Use

### Creating a List Card

1. Go to a deck and click "Add Cards"
2. Select "List" as the card type
3. Fill in:
   - **Prompt**: The question/prompt (e.g., "List the 7 OSI layers")
   - **Items**: Add each item in the list
   - **Aliases** (optional): For each item, you can add alternative names/spellings
   - **Order matters**: Toggle to enable ordered mode
4. Click "Add Card"

### During Review

1. The prompt/question is displayed
2. Click "Show Answer"
3. Type your recalled items, one per line
4. Press Ctrl/Cmd+Enter or click "Submit Answer"
5. Review the results:
   - See which items you got right
   - See which items you missed
   - See any extra items you added
   - For ordered lists: see which items are correct but in wrong position
6. Rate yourself using Again/Hard/Good/Easy buttons (or use suggested rating)

## Technical Details

### Data Model

```typescript
type ListCardContent = {
  type: "list"
  order: "unordered" | "ordered"
  grading?: {
    orderedMode?: "strict-position" | "lcs"
    normalize?: "basic" | "aggressive"
  }
}

type ListNoteContent = {
  type: "list"
  promptHtml: string
  items: Array<{
    text: string
    aliases?: string[]
  }>
}
```

### Grading Algorithm

1. **Normalization**: Both expected and user items are normalized
2. **Unordered Matching**: Set-based matching (no duplicates counted)
3. **Ordered Matching**: Strict position matching (item must be at correct index)

### Files Created

- `src/logic/type-implementations/list/types.ts` - Type definitions
- `src/logic/type-implementations/list/grading.ts` - Grading logic
- `src/logic/type-implementations/list/ListNote.tsx` - Note type adapter
- `src/logic/type-implementations/list/ListCardReview.tsx` - Review UI component
- `src/logic/type-implementations/list/createListNote.ts` - Note creation
- `src/logic/type-implementations/list/updateListNote.ts` - Note update
- `src/app/editor/NoteEditor/ListCardEditor.tsx` - Editor component

## Future Enhancements

- LCS (Longest Common Subsequence) mode for ordered lists (partial credit for mostly-correct order)
- Aggressive normalization mode (remove punctuation)
- Fuzzy matching for typos
- Drag-and-drop reordering in review interface
