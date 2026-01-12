import NormalCardEditor from "@/app/editor/NoteEditor/NormalCardEditor";
import { NoteEditorProps, NoteTypeAdapter } from "@/logic/NoteTypeAdapter";
import { Card, HTMLtoPreviewString } from "@/logic/card/card";
import { createCardSkeleton } from "@/logic/card/createCardSkeleton";
import { deleteCard } from "@/logic/card/deleteCard";
import { newCard } from "@/logic/card/newCard";
import { db } from "@/logic/db";
import { Deck } from "@/logic/deck/deck";
import { NoteContent } from "@/logic/note/NoteContent";
import { newNote } from "@/logic/note/newNote";
import { NoteType } from "@/logic/note/note";
import { Note } from "@/logic/note/note";
import { updateNoteContent } from "@/logic/note/updateNoteContent";
import common from "@/style/CommonStyles.module.css";
import { Divider, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { BasicCardReview } from "./BasicCardReview";

export const BasicNoteTypeAdapter: NoteTypeAdapter<NoteType.Basic> = {
  async createNote(params: { front: string; back: string }, deck: Deck) {
    return db.transaction("rw", db.notes, db.decks, db.cards, async () => {
      const noteId = await newNote(deck, {
        type: NoteType.Basic,
        front: params.front,
        back: params.back,
      });
      await newCard(
        {
          ...createCardSkeleton(),
          note: noteId,
          content: { type: NoteType.Basic },
        },
        deck
      );
    });
  },

  async updateNote(
    params: { front: string; back: string },
    existingNote: Note<NoteType.Basic>
  ) {
    return db.transaction("rw", db.notes, db.cards, async () => {
      await updateNoteContent(existingNote.id, {
        type: NoteType.Basic,
        front: params.front,
        back: params.back,
      });
    });
  },

  displayQuestion(
    card: Card<NoteType.Basic>,
    content?: NoteContent<NoteType.Basic>,
    place?: "learn" | "notebook"
  ) {
    // In learn view, show question with input field
    if (place === "learn") {
      return <BasicCardReview card={card} content={content} showingAnswer={false} />;
    }
    
    // In notebook view, just show the question
    return (
      <Title
        order={3}
        fw={600}
        dangerouslySetInnerHTML={{ __html: content?.front ?? "" }}
      ></Title>
    );
  },

  displayAnswer(
    card: Card<NoteType.Basic>,
    content?: NoteContent<NoteType.Basic>,
    place?: "learn" | "notebook"
  ) {
    // In notebook view, just show the answer
    if (place === "notebook") {
      return (
        <Stack gap={place === "notebook" ? "sm" : "lg"} w="100%">
          {BasicNoteTypeAdapter.displayQuestion(card, content)}
          <Divider className={common.lightBorderColor} />
          <div 
            className={common.preserveWhitespace}
            dangerouslySetInnerHTML={{ __html: content?.back ?? "" }}
          ></div>
        </Stack>
      );
    }

    // In learn view, show the interactive review component with input field
    // Note: showingAnswer is passed via the LearnView context
    return <BasicCardReview card={card} content={content} showingAnswer={true} />;
  },

  displayNote(
    note: Note<NoteType.Basic>,
    showAllAnswers: "strict" | "optional" | "none"
  ) {
    const [individualShowAnswer, setIndividualShowAnswer] = useState(false);

    return (
      <Stack
        gap="sm"
        w="100%"
        onClick={() => setIndividualShowAnswer(!individualShowAnswer)}
      >
        <Title
          order={3}
          fw={600}
          dangerouslySetInnerHTML={{ __html: note.content?.front ?? "" }}
        />
        {showAllAnswers !== "none" && (
          <>
            <Divider className={common.lightBorderColor} />
            <div
              className={common.preserveWhitespace}
              dangerouslySetInnerHTML={{ __html: note.content?.back ?? "" }}
            />
          </>
        )}
      </Stack>
    );
  },

  getSortFieldFromNoteContent(content?: NoteContent<NoteType.Basic>) {
    return HTMLtoPreviewString(content?.front ?? "[error]");
  },

  editor({
    note,
    deck,
    mode,
    requestedFinish,
    setRequestedFinish,
    focusSelectNoteType,
  }: NoteEditorProps) {
    return (
      <NormalCardEditor
        note={note as Note<NoteType.Basic> | null}
        deck={deck}
        mode={mode}
        requestedFinish={requestedFinish}
        setRequestedFinish={setRequestedFinish}
        focusSelectNoteType={focusSelectNoteType}
      />
    );
  },

  async deleteCard(card: Card<NoteType.Basic>) {
    deleteCard(card);
  },
};
