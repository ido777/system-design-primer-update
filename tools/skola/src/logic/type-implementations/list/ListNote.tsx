import ListCardEditor from "@/app/editor/NoteEditor/ListCardEditor";
import { NoteEditorProps, NoteTypeAdapter } from "@/logic/NoteTypeAdapter";
import { Card, HTMLtoPreviewString } from "@/logic/card/card";
import { deleteCard } from "@/logic/card/deleteCard";
import { db } from "@/logic/db";
import { NoteContent } from "@/logic/note/NoteContent";
import { Note, NoteType } from "@/logic/note/note";
import common from "@/style/CommonStyles.module.css";
import { Divider, Stack, Title } from "@mantine/core";
import { ListCardReview } from "./ListCardReview";
import createListNote from "./createListNote";
import { updateListNote } from "./updateListNote";

export const ListNoteTypeAdapter: NoteTypeAdapter<NoteType.List> = {
  createNote: createListNote,

  updateNote: updateListNote,

  displayQuestion(
    card: Card<NoteType.List>,
    content?: NoteContent<NoteType.List>
  ) {
    return (
      <Title
        order={3}
        fw={600}
        dangerouslySetInnerHTML={{ __html: content?.promptHtml ?? "" }}
      ></Title>
    );
  },

  displayAnswer(
    card: Card<NoteType.List>,
    content?: NoteContent<NoteType.List>,
    place?: "learn" | "notebook"
  ) {
    // In notebook view, just show the expected items
    if (place === "notebook") {
      return (
        <Stack gap={place === "notebook" ? "sm" : "lg"} w="100%">
          {ListNoteTypeAdapter.displayQuestion(card, content)}
          <Divider className={common.lightBorderColor} />
          <Stack gap="xs">
            {content?.items.map((item, index) => (
              <div key={index}>
                {card.content.order === "ordered" && (
                  <strong>{index + 1}. </strong>
                )}
                <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
              </div>
            ))}
          </Stack>
        </Stack>
      );
    }

    // In learn view, show the interactive review component
    return <ListCardReview card={card} content={content} />;
  },

  displayNote(
    note: Note<NoteType.List>,
    showAllAnswers: "strict" | "optional" | "none"
  ) {
    return (
      <Stack gap="sm" w="100%">
        <Title
          order={3}
          fw={600}
          dangerouslySetInnerHTML={{ __html: note.content?.promptHtml ?? "" }}
        />
        {showAllAnswers !== "none" && (
          <>
            <Divider className={common.lightBorderColor} />
            <Stack gap="xs">
              {note.content?.items.map((item, index) => (
                <div key={index}>
                  <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                </div>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    );
  },

  getSortFieldFromNoteContent(content?: NoteContent<NoteType.List>) {
    return HTMLtoPreviewString(content?.promptHtml ?? "[error]");
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
      <ListCardEditor
        note={note as Note<NoteType.List> | null}
        deck={deck}
        mode={mode}
        requestedFinish={requestedFinish}
        setRequestedFinish={setRequestedFinish}
        focusSelectNoteType={focusSelectNoteType}
      />
    );
  },

  //DEPRECATED
  async deleteCard(card: Card<NoteType.List>) {
    db.transaction("rw", db.decks, db.cards, db.notes, async () => {
      await deleteCard(card);
    });
  },
};
