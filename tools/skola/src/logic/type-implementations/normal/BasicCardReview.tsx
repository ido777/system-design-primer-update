import { Card } from "@/logic/card/card";
import { NoteContent } from "@/logic/note/NoteContent";
import { NoteType } from "@/logic/note/note";
import { Divider, Stack, Text, Textarea, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import common from "@/style/CommonStyles.module.css";
import classes from "./BasicCardReview.module.css";

// Store user answers outside component to persist across re-renders
const userAnswers = new Map<string, string>();

interface BasicCardReviewProps {
  card: Card<NoteType.Basic>;
  content?: NoteContent<NoteType.Basic>;
  showingAnswer?: boolean;
}

export function BasicCardReview({
  card,
  content,
  showingAnswer = false,
}: BasicCardReviewProps) {
  const [userAnswer, setUserAnswer] = useState(() => userAnswers.get(card.id) || "");

  // Sync with external storage
  useEffect(() => {
    userAnswers.set(card.id, userAnswer);
  }, [card.id, userAnswer]);

  // Reset when card changes
  useEffect(() => {
    const stored = userAnswers.get(card.id);
    if (stored !== undefined) {
      setUserAnswer(stored);
    } else {
      setUserAnswer("");
    }
  }, [card.id]);

  if (!content) {
    return <Text c="red">Error: Content not found</Text>;
  }

  if (!showingAnswer) {
    // Show question and input field
    return (
      <Stack gap="lg" w="100%">
        <Title
          order={3}
          fw={600}
          dangerouslySetInnerHTML={{ __html: content?.front ?? "" }}
        />
        <Textarea
          placeholder="Type your answer here..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.currentTarget.value)}
          minRows={4}
          autosize
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              // This will be handled by the parent when "Show Answer" is clicked
            }
          }}
        />
        <Text size="sm" c="dimmed">
          Type your answer, then click "Show Answer" below to compare
        </Text>
      </Stack>
    );
  }

  // Show comparison: user answer vs correct answer
  return (
    <Stack gap="lg" w="100%">
      <Title
        order={3}
        fw={600}
        dangerouslySetInnerHTML={{ __html: content?.front ?? "" }}
      />
      <Divider className={common.lightBorderColor} />
      
      {/* User's Answer */}
      <Stack gap="xs">
        <Text fw={600} size="sm" c="blue">
          Your Answer:
        </Text>
        <div className={classes.answerBox}>
          <Text style={{ whiteSpace: "pre-wrap" }} c="inherit">
            {userAnswer || "(empty)"}
          </Text>
        </div>
      </Stack>

      {/* Correct Answer */}
      <Stack gap="xs">
        <Text fw={600} size="sm" c="green">
          Correct Answer:
        </Text>
        <div 
          className={`${classes.answerBox} ${common.preserveWhitespace}`}
          dangerouslySetInnerHTML={{ __html: content?.back ?? "" }}
        />
      </Stack>
    </Stack>
  );
}
