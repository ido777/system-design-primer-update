import { Card } from "@/logic/card/card";
import { NoteContent } from "@/logic/note/NoteContent";
import { NoteType } from "@/logic/note/note";
import { Badge, Button, Divider, Stack, Text, Textarea } from "@mantine/core";
import { Rating } from "fsrs.js";
import { useState } from "react";
import { gradeListCard, GradingResult } from "./grading";
import { ListCardContent } from "./types";
import classes from "./ListCardReview.module.css";

interface ListCardReviewProps {
  card: Card<NoteType.List>;
  content?: NoteContent<NoteType.List>;
  onRatingSelect?: (rating: Rating) => void;
}

export function ListCardReview({
  card,
  content,
  onRatingSelect,
}: ListCardReviewProps) {
  const [userInput, setUserInput] = useState("");
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!content) return;
    const result = gradeListCard(card.content as ListCardContent, content, userInput);
    setGradingResult(result);
    setHasSubmitted(true);
  };

  if (!content) {
    return <Text c="red">Error: Content not found</Text>;
  }

  const cardContent = card.content as ListCardContent;
  const isOrdered = cardContent.order === "ordered";

  if (!hasSubmitted) {
    // Show input field
    return (
      <Stack gap="lg" w="100%">
        <Textarea
          placeholder={
            isOrdered
              ? "Enter one item per line (order matters)"
              : "Enter one item per line"
          }
          value={userInput}
          onChange={(e) => setUserInput(e.currentTarget.value)}
          minRows={5}
          autosize
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Button onClick={handleSubmit} disabled={!userInput.trim()}>
          Submit Answer
        </Button>
      </Stack>
    );
  }

  // Show results
  if (!gradingResult) {
    return <Text>Error: No grading result</Text>;
  }

  const scorePercent = Math.round(gradingResult.score * 100);
  const matchedCount = gradingResult.matched.length;
  const totalCount = content.items.length;

  return (
    <Stack gap="lg" w="100%">
      {/* Score summary */}
      <Stack gap="xs">
        <Text fw={600} size="lg">
          You recalled {matchedCount}/{totalCount} ({scorePercent}%)
        </Text>
        {gradingResult.suggestedRating && (
          <Text c="dimmed" size="sm">
            Suggested rating: <strong>{gradingResult.suggestedRating}</strong>
          </Text>
        )}
      </Stack>

      <Divider />

      {/* Matched items */}
      {gradingResult.matched.length > 0 && (
        <Stack gap="xs">
          <Text fw={600} c="green">
            ✓ Matched ({gradingResult.matched.length})
          </Text>
          <Stack gap={4}>
            {gradingResult.matched.map((item, idx) => {
              const isWrongPosition =
                gradingResult.wrongPosition?.includes(idx) || false;
              // Find the expected index for this item
              const expectedIndex = content.items.findIndex(
                (i) => i.text === item
              );
              return (
                <div key={idx} className={classes.resultItem}>
                  {isOrdered && !isWrongPosition && expectedIndex >= 0 && (
                    <Badge color="green" size="sm" mr="xs">
                      {expectedIndex + 1}
                    </Badge>
                  )}
                  {isOrdered && isWrongPosition && (
                    <Badge color="yellow" size="sm" mr="xs">
                      Wrong position
                    </Badge>
                  )}
                  <span dangerouslySetInnerHTML={{ __html: item }}></span>
                </div>
              );
            })}
          </Stack>
        </Stack>
      )}

      {/* Missing items */}
      {gradingResult.missing.length > 0 && (
        <Stack gap="xs">
          <Text fw={600} c="red">
            ✗ Missing ({gradingResult.missing.length})
          </Text>
          <Stack gap={4}>
            {gradingResult.missing.map((item, idx) => (
              <div key={idx} className={classes.resultItem}>
                {isOrdered && (
                  <Badge color="red" size="sm" mr="xs">
                    {content.items.findIndex((i) => i.text === item) + 1}
                  </Badge>
                )}
                <span dangerouslySetInnerHTML={{ __html: item }}></span>
              </div>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Extra items */}
      {gradingResult.extras.length > 0 && (
        <Stack gap="xs">
          <Text fw={600} c="orange">
            ⚠ Extra items ({gradingResult.extras.length})
          </Text>
          <Stack gap={4}>
            {gradingResult.extras.map((item, idx) => (
              <div key={idx} className={classes.resultItem}>
                <span>{item}</span>
              </div>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Expected answer (for reference) */}
      <Divider />
      <Stack gap="xs">
        <Text fw={600} size="sm" c="dimmed">
          Expected answer:
        </Text>
        <Stack gap={4}>
          {content.items.map((item, idx) => (
            <div key={idx} className={classes.resultItem}>
              {isOrdered && (
                <Badge color="gray" size="sm" mr="xs">
                  {idx + 1}
                </Badge>
              )}
              <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
            </div>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
