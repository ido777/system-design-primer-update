import { HTMLtoPreviewString } from "@/logic/card/card";
import { createCardSkeleton } from "@/logic/card/createCardSkeleton";
import { newCard } from "@/logic/card/newCard";
import { db } from "@/logic/db";
import { Deck } from "@/logic/deck/deck";
import { newNote } from "@/logic/note/newNote";
import { NoteType } from "@/logic/note/note";
import { ListNoteContent } from "./types";

export default async function createListNote(
  params: {
    promptHtml: string;
    items: ListNoteContent["items"];
    order: "unordered" | "ordered";
  },
  deck: Deck
) {
  function createListCard(
    noteId: string,
    order: "unordered" | "ordered",
    promptHtml: string
  ) {
    return {
      ...createCardSkeleton(),
      note: noteId,
      preview: HTMLtoPreviewString(promptHtml),
      content: {
        type: NoteType.List,
        order: order,
      },
    };
  }
  return db.transaction("rw", db.notes, db.decks, db.cards, async () => {
    const noteId = await newNote(deck, {
      type: NoteType.List,
      promptHtml: params.promptHtml,
      items: params.items,
    });
    await newCard(createListCard(noteId, params.order, params.promptHtml), deck);
  });
}
