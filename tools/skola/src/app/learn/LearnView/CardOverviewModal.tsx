import { Card } from "@/logic/card/card";
import { NoteType } from "@/logic/note/note";
import { db } from "@/logic/db";
import { getAdapter } from "@/logic/NoteTypeAdapter";
import {
  IconBracketsContain,
  IconCards,
  IconListNumbers,
  IconPhoto,
  IconTextCaption,
} from "@tabler/icons-react";
import { Group, Modal, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import classes from "./CardOverviewModal.module.css";

interface CardOverviewModalProps {
  opened: boolean;
  onClose: () => void;
  cards: Card<NoteType>[];
  currentCard: Card<NoteType> | null;
  onSelectCard: (card: Card<NoteType>) => void;
}

/**
 * Returns an appropriate icon for the given card type
 */
function getCardTypeIcon(cardType: NoteType) {
  switch (cardType) {
    case NoteType.Basic:
      return <IconCards size={16} />;
    case NoteType.Cloze:
      return <IconBracketsContain size={16} />;
    case NoteType.List:
      return <IconListNumbers size={16} />;
    case NoteType.DoubleSided:
      return <IconTextCaption size={16} />;
    case NoteType.ImageOcclusion:
      return <IconPhoto size={16} />;
    default:
      return <IconCards size={16} />;
  }
}

function CardPreviewItem({
  card,
  isCurrent,
  isSelected,
  onSelect,
  onHover,
  preview,
}: {
  card: Card<NoteType>;
  isCurrent: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
  preview: string;
}) {

  return (
    <div
      className={`${classes.cardPreview} ${isCurrent ? classes.currentCard : ""} ${
        isSelected ? classes.selectedCard : ""
      }`}
      onClick={onSelect}
      onMouseEnter={onHover}
    >
      <Group gap="xs" wrap="nowrap" align="center">
        <div className={classes.iconContainer}>
          {getCardTypeIcon(card.content.type)}
        </div>
        <Text size="sm" fw={isCurrent ? 600 : 400} style={{ flex: 1 }}>
          {preview}
        </Text>
      </Group>
    </div>
  );
}

export function CardOverviewModal({
  opened,
  onClose,
  cards,
  currentCard,
  onSelectCard,
}: CardOverviewModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [cardPreviews, setCardPreviews] = useState<Map<string, string>>(new Map());

  // Load previews for all cards
  useEffect(() => {
    if (opened && cards.length > 0) {
      const loadPreviews = async () => {
        const previews = new Map<string, string>();
        for (const card of cards) {
          try {
            const note = await db.notes.get(card.note);
            if (note) {
              const adapter = getAdapter(card);
              const previewText = adapter.getSortFieldFromNoteContent(note.content);
              previews.set(card.id, previewText);
            } else {
              previews.set(card.id, "Card");
            }
          } catch {
            previews.set(card.id, "Card");
          }
        }
        setCardPreviews(previews);
      };
      loadPreviews();
    }
  }, [opened, cards]);

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) {
      return cards;
    }
    const query = searchQuery.toLowerCase();
    return cards.filter((card) => {
      const preview = cardPreviews.get(card.id) || "";
      return preview.toLowerCase().includes(query);
    });
  }, [cards, searchQuery, cardPreviews]);

  // Reset selection when modal opens or search changes
  useEffect(() => {
    if (opened) {
      const currentIndex = filteredCards.findIndex((c) => c.id === currentCard?.id);
      setSelectedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [opened, filteredCards, currentCard]);

  // Reset search when modal closes
  useEffect(() => {
    if (!opened) {
      setSearchQuery("");
    }
  }, [opened]);

  useHotkeys(
    opened
      ? [
          [
            "ArrowDown",
            () => {
              setSelectedIndex((prev) => Math.min(prev + 1, filteredCards.length - 1));
            },
          ],
          [
            "ArrowUp",
            () => {
              setSelectedIndex((prev) => Math.max(prev - 1, 0));
            },
          ],
          [
            "Enter",
            () => {
              if (filteredCards[selectedIndex]) {
                onSelectCard(filteredCards[selectedIndex]);
                onClose();
              }
            },
          ],
          ["Escape", () => onClose()],
        ]
      : []
  );

  if (cards.length === 0) {
    return (
      <Modal opened={opened} onClose={onClose} title="Card Overview" size="xl">
        <Text c="dimmed">No cards available</Text>
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Card Overview"
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack gap="xs">
        <TextInput
          placeholder="Search cards..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSearchQuery("");
            }
          }}
        />
        <Text size="sm" c="dimmed">
          {filteredCards.length === 0
            ? "No cards match your search"
            : searchQuery
            ? `Found ${filteredCards.length} of ${cards.length} cards`
            : `Showing ${cards.length} cards. Use arrow keys to navigate, Enter to select, Esc to close`}
        </Text>
        <ScrollArea h={400}>
          <Stack gap="xs">
            {filteredCards.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No cards match "{searchQuery}"
              </Text>
            ) : (
              filteredCards.map((card, index) => {
                const isCurrent = currentCard?.id === card.id;
                const isSelected = index === selectedIndex;

                return (
                  <CardPreviewItem
                    key={card.id}
                    card={card}
                    isCurrent={isCurrent}
                    isSelected={isSelected}
                    onSelect={() => {
                      onSelectCard(card);
                      onClose();
                    }}
                    onHover={() => setSelectedIndex(index)}
                    preview={cardPreviews.get(card.id) || "Loading..."}
                  />
                );
              })
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Modal>
  );
}
