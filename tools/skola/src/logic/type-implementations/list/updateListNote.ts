import { db } from "@/logic/db";
import { Note, NoteType } from "@/logic/note/note";
import { updateNoteContent } from "@/logic/note/updateNoteContent";
import { ListNoteContent } from "./types";

export async function updateListNote(
  params: {
    promptHtml: string;
    items: ListNoteContent["items"];
  },
  existingNote: Note<NoteType.List>
) {
  return db.transaction("rw", db.notes, db.cards, async () => {
    await updateNoteContent(existingNote.id, {
      type: NoteType.List,
      promptHtml: params.promptHtml,
      items: params.items,
    });
  });
}
