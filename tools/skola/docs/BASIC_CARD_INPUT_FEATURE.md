# Basic Card Input Feature

## Overview

Basic cards now support an interactive input field where users can type their answer before seeing the correct answer. This helps with active recall practice.

## Features

### 1. **Input Field During Review**
- When reviewing a basic card, users see:
  - The question (front)
  - A textarea input field to type their answer
  - Instructions to click "Show Answer" when ready

### 2. **Answer Comparison**
- After clicking "Show Answer", users see:
  - The question (front)
  - **Your Answer**: What the user typed (in a blue box)
  - **Correct Answer**: The actual answer from the deck (in a green box)
- This allows side-by-side comparison for self-assessment

### 3. **State Persistence**
- User's typed answer persists when switching between question and answer views
- Answer is cleared when moving to the next card
- Uses a Map keyed by card.id to store answers

## Implementation Details

### Component: `BasicCardReview`
- Located: `src/logic/type-implementations/normal/BasicCardReview.tsx`
- Manages input state and displays comparison view
- Receives `showingAnswer` prop to control view state

### Integration
- `displayQuestion()` shows input field in learn view
- `displayAnswer()` shows comparison in learn view
- Notebook view remains unchanged (no input field)

## Multiline Support

### Seeding
- Multiline strings in YAML/JSON are automatically converted:
  - `\n` → `<br>` tags
  - Plain text is HTML-escaped
  - Existing HTML is preserved

### Display
- CSS class `preserveWhitespace` ensures:
  - `white-space: pre-wrap` preserves line breaks
  - `<br>` tags render correctly
  - Proper line spacing

### CSS Classes
- `.preserveWhitespace` - Applied to all answer displays
- `.answerBox` - Styled boxes for user/correct answer comparison

## Usage

1. **During Review**:
   - Question appears
   - Type your answer in the textarea
   - Click "Show Answer" button

2. **After Showing Answer**:
   - See your answer vs correct answer
   - Compare and self-assess
   - Rate yourself (Again/Hard/Good/Easy)

3. **Next Card**:
   - Input field resets automatically
   - Previous answer is cleared

## Technical Notes

- State is stored in a module-level Map (not persisted to database)
- Answers are cleared when card changes
- Works seamlessly with existing FSRS scheduling
- No changes needed to card data model
