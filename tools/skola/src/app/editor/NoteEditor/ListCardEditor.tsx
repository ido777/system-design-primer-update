import NoteEditor, { useNoteEditor } from "@/app/editor/NoteEditor/NoteEditor";
import {
  addFailed,
  saveFailed,
  successfullyAdded,
  successfullySaved,
} from "@/components/Notification/Notification";
import { EditMode } from "@/logic/NoteTypeAdapter";
import { Deck } from "@/logic/deck/deck";
import { Content } from "@/logic/card/CardContent";
import { db } from "@/logic/db";
import { getCardsReferencingNote } from "@/logic/note/getCardsReferencingNote";
import { NoteType } from "@/logic/note/note";
import { Note } from "@/logic/note/note";
import { ListNoteTypeAdapter } from "@/logic/type-implementations/list/ListNote";
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { Editor } from "@tiptap/react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import classes from "./ListCardEditor.module.css";

interface ListCardEditorProps {
  note: Note<NoteType.List> | null;
  deck: Deck;
  mode: EditMode;
  requestedFinish: boolean;
  setRequestedFinish: (finish: boolean) => void;
  focusSelectNoteType?: () => void;
}

interface ListItem {
  text: string;
  aliases: string[];
}

function ListCardEditor({
  note,
  deck,
  mode,
  requestedFinish,
  setRequestedFinish,
  focusSelectNoteType,
}: ListCardEditorProps) {
  const [t] = useTranslation();

  useHotkeys([["mod+Enter", () => setRequestedFinish(true)]]);

  const noteContent = note?.content ?? {
    type: NoteType.List,
    promptHtml: "",
    items: [],
  };

  const [order, setOrder] = useState<"unordered" | "ordered">("unordered");

  // Fetch card order when editing
  useEffect(() => {
    if (note && mode === "edit") {
      getCardsReferencingNote(note).then((cards) => {
        if (cards.length > 0) {
          const cardContent = cards[0].content as Content<NoteType.List>;
          setOrder(cardContent.order || "unordered");
        }
      });
    }
  }, [note, mode]);
  const [items, setItems] = useState<ListItem[]>(
    noteContent.items.map((item) => ({
      text: item.text,
      aliases: item.aliases || [],
    }))
  );

  const promptEditor = useNoteEditor({
    content: noteContent.promptHtml,
    finish: () => setRequestedFinish(true),
    focusSelectNoteType: focusSelectNoteType,
  });

  const addItem = useCallback(() => {
    setItems([...items, { text: "", aliases: [] }]);
  }, [items]);

  const removeItem = useCallback(
    (index: number) => {
      setItems(items.filter((_, i) => i !== index));
    },
    [items]
  );

  const updateItemText = useCallback(
    (index: number, text: string) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], text };
      setItems(newItems);
    },
    [items]
  );

  const addAlias = useCallback(
    (itemIndex: number) => {
      const newItems = [...items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        aliases: [...newItems[itemIndex].aliases, ""],
      };
      setItems(newItems);
    },
    [items]
  );

  const removeAlias = useCallback(
    (itemIndex: number, aliasIndex: number) => {
      const newItems = [...items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        aliases: newItems[itemIndex].aliases.filter((_, i) => i !== aliasIndex),
      };
      setItems(newItems);
    },
    [items]
  );

  const updateAlias = useCallback(
    (itemIndex: number, aliasIndex: number, value: string) => {
      const newItems = [...items];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        aliases: newItems[itemIndex].aliases.map((alias, i) =>
          i === aliasIndex ? value : alias
        ),
      };
      setItems(newItems);
    },
    [items]
  );

  const clear = useCallback(() => {
    promptEditor?.commands.setContent("");
    setItems([{ text: "", aliases: [] }]);
    setOrder("unordered");
    promptEditor?.commands.focus();
  }, [promptEditor]);

  useEffect(() => {
    if (requestedFinish) {
      finish(mode, clear, deck, note, promptEditor, items, order);
      setRequestedFinish(false);
    }
  }, [requestedFinish, mode, clear, deck, note, promptEditor, items, order]);

  return (
    <Stack gap="2rem">
      <Stack gap={0}>
        <Text fz="sm" fw={600}>
          {t("note.edit.type-specific.list.prompt")}
        </Text>
        <NoteEditor editor={promptEditor} key="prompt" />
      </Stack>

      <Stack gap="sm">
        <Group justify="space-between" align="center">
          <Text fz="sm" fw={600}>
            {t("note.edit.type-specific.list.items")}
          </Text>
          <Checkbox
            label={t("note.edit.type-specific.list.ordered")}
            checked={order === "ordered"}
            onChange={(e) => setOrder(e.currentTarget.checked ? "ordered" : "unordered")}
          />
        </Group>

        <Stack gap="md">
          {items.map((item, itemIndex) => (
            <Stack key={itemIndex} gap="xs" className={classes.itemRow}>
              <Group gap="xs" align="flex-start" wrap="nowrap">
                <TextInput
                  placeholder={t("note.edit.type-specific.list.item-placeholder", {
                    number: itemIndex + 1,
                  })}
                  value={item.text}
                  onChange={(e) => updateItemText(itemIndex, e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => removeItem(itemIndex)}
                  disabled={items.length === 1}
                >
                  ×
                </ActionIcon>
              </Group>
              {item.aliases.length > 0 && (
                <Stack gap="xs" pl="md">
                  {item.aliases.map((alias, aliasIndex) => (
                    <Group key={aliasIndex} gap="xs" align="center">
                      <Text fz="xs" c="dimmed">
                        {t("note.edit.type-specific.list.alias")}:
                      </Text>
                      <TextInput
                        placeholder={t("note.edit.type-specific.list.alias-placeholder")}
                        value={alias}
                        onChange={(e) =>
                          updateAlias(itemIndex, aliasIndex, e.currentTarget.value)
                        }
                        style={{ flex: 1 }}
                        size="xs"
                      />
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        size="sm"
                        onClick={() => removeAlias(itemIndex, aliasIndex)}
                      >
                        ×
                      </ActionIcon>
                    </Group>
                  ))}
                </Stack>
              )}
              <Button
                variant="subtle"
                size="xs"
                onClick={() => addAlias(itemIndex)}
                style={{ alignSelf: "flex-start" }}
              >
                + {t("note.edit.type-specific.list.add-alias")}
              </Button>
            </Stack>
          ))}
        </Stack>

        <Button variant="light" onClick={addItem}>
          + {t("note.edit.type-specific.list.add-item")}
        </Button>
      </Stack>
    </Stack>
  );
}

async function finish(
  mode: EditMode,
  clear: () => void,
  deck: Deck,
  note: Note<NoteType.List> | null,
  promptEditor: Editor | null,
  items: ListItem[],
  order: "unordered" | "ordered"
) {
  // Filter out empty items
  const validItems = items.filter((item) => item.text.trim().length > 0);
  const itemsWithAliases = validItems.map((item) => ({
    text: item.text,
    aliases: item.aliases.filter((alias) => alias.trim().length > 0),
  }));

  if (mode === "edit") {
    //SAVE
    try {
      if (!note) throw new Error("Note is null");
      await ListNoteTypeAdapter.updateNote(
        {
          promptHtml: promptEditor?.getHTML() ?? "",
          items: itemsWithAliases,
        },
        note
      );
      // Also update card content (order) - update all cards from this note
      const cards = await getCardsReferencingNote(note);
      for (const card of cards) {
        await db.cards.update(card.id, {
          content: {
            type: NoteType.List,
            order: order,
          } as Content<NoteType.List>,
        });
      }
      successfullySaved();
    } catch {
      saveFailed();
    }
  } else {
    //NEW
    try {
      await ListNoteTypeAdapter.createNote(
        {
          promptHtml: promptEditor?.getHTML() ?? "",
          items: itemsWithAliases,
          order: order,
        },
        deck
      );
      clear && clear();
      successfullyAdded();
    } catch {
      addFailed();
    }
  }
}

export default ListCardEditor;
