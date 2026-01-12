import { AppHeaderContent } from "@/app/shell/Header/Header";
import MissingObject from "@/components/MissingObject";
import { genericFail } from "@/components/Notification/Notification";
import { getAdapter } from "@/logic/NoteTypeAdapter";
import { CardSorts } from "@/logic/card/CardSorting";
import { getCardsOf } from "@/logic/card/getCardsOf";
import { useDeckFromUrl } from "@/logic/deck/hooks/useDeckFromUrl";
import { useLearning } from "@/logic/learn";
import { useNote } from "@/logic/note/hooks/useNote";
import { useSetting } from "@/logic/settings/hooks/useSetting";
import { ActionIcon, Center, Flex, Modal, Paper, Tooltip } from "@mantine/core";
import { useDebouncedValue, useHotkeys } from "@mantine/hooks";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Rating } from "fsrs.js";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FinishedLearningView from "../FinishedLearningView/FinishedLearningView";
import LearnViewCurrentCardStateIndicator from "../LearnViewCurrentCardStateIndicator/LearnViewCurrentCardStateIndicator";
import { CardOverviewModal } from "./CardOverviewModal";
import classes from "./LearnView.module.css";
import LearnViewFooter from "./LearnViewFooter";
import LearnViewHeader, { stopwatchResult } from "./LearnViewHeader";
import VisualFeedback from "./VisualFeedback";

function LearnView() {
  const [useVisualFeedback] = useSetting("useVisualFeedback");

  const navigate = useNavigate();
  const [deck, isReady, params] = useDeckFromUrl();

  const [newToReviewRatio] = useSetting("learn_newToReviewRatio");
  const controller = useLearning(
    {
      querier: () => getCardsOf(deck),
      dependencies: [deck],
    },
    {
      learnAll: params === "all",
      newToReviewRatio: newToReviewRatio,
      sort: CardSorts.byCreationDate(1),
    },
  );

  const cardContent = useNote(controller.currentCard?.note ?? "")?.content;

  const [currentRating, setCurrentRating] = useState<Rating | null>(null);
  const [overviewOpened, setOverviewOpened] = useState(false);

  const [debouncedFinish] = useDebouncedValue(controller.isFinished, 50);

  // Navigation hotkeys
  useHotkeys(
    !controller.isFinished && !overviewOpened
      ? [
          ["ArrowLeft", () => {
            if (controller.showingAnswer) {
              controller.requestPreviousCard();
            }
          }],
          ["ArrowRight", () => {
            if (controller.showingAnswer) {
              controller.requestNextCard();
            } else {
              controller.showAnswer();
            }
          }],
        ]
      : []
  );

  const answerButtonPressed = useCallback(
    async (rating: Rating) => {
      try {
        controller.answerCard(rating);
        controller.requestNextCard();
        setCurrentRating(rating);
        setTimeout(() => setCurrentRating(null), 150);
      } catch (error) {
        genericFail();
        console.log(error);
      }
    },
    [controller],
  );

  useEffect(() => {
    if (controller.isFinished) {
      stopwatchResult && stopwatchResult.pause();
    } else {
      stopwatchResult && stopwatchResult.start();
    }
  }, [controller.isFinished]);

  if (isReady && !deck) {
    return <MissingObject />;
  }

  return (
    <div className={classes.learnView}>
      <AppHeaderContent>
        <LearnViewHeader
          currentCard={controller.currentCard ?? undefined}
          controller={controller}
          deck={deck}
          onOpenOverview={() => setOverviewOpened(true)}
        />
      </AppHeaderContent>

      <Flex
        direction="column"
        justify="space-between"
        h="100%"
        w="100%"
        className={classes.learnViewWrapper}
      >
        {useVisualFeedback && <VisualFeedback rating={currentRating} />}
        
        {/* Navigation buttons at edges */}
        {!controller.isFinished && (
          <>
            {/* Left edge - Previous */}
            {controller.showingAnswer && (
              <Tooltip label="Previous Card (←)" position="right">
                <ActionIcon
                  className={classes.navButtonLeft}
                  variant="filled"
                  size="xl"
                  radius="xl"
                  onClick={() => controller.requestPreviousCard()}
                  aria-label="Previous card"
                >
                  <IconArrowLeft size={24} />
                </ActionIcon>
              </Tooltip>
            )}

            {/* Right edge - Next/Show Answer */}
            <Tooltip
              label={controller.showingAnswer ? "Next Card (→)" : "Show Answer (→)"}
              position="left"
            >
              <ActionIcon
                className={classes.navButtonRight}
                variant="filled"
                size="xl"
                radius="xl"
                onClick={() => {
                  if (controller.showingAnswer) {
                    controller.requestNextCard();
                  } else {
                    controller.showAnswer();
                  }
                }}
                aria-label={controller.showingAnswer ? "Next card" : "Show answer"}
              >
                <IconArrowRight size={24} />
              </ActionIcon>
            </Tooltip>
          </>
        )}

        <Center className={classes.cardContainer}>
          <Paper className={classes.card}>
            <LearnViewCurrentCardStateIndicator
              currentCardModel={controller.currentCard?.model}
            />
            {!controller.showingAnswer &&
              controller.currentCard &&
              getAdapter(controller.currentCard).displayQuestion(
                controller.currentCard,
                cardContent,
                "learn",
              )}
            {controller.showingAnswer &&
              controller.currentCard &&
              getAdapter(controller.currentCard).displayAnswer(
                controller.currentCard,
                cardContent,
                "learn",
              )}
          </Paper>
        </Center>
        <LearnViewFooter controller={controller} answer={answerButtonPressed} />

        <CardOverviewModal
          opened={overviewOpened}
          onClose={() => setOverviewOpened(false)}
          cards={controller.allCards.length > 0 ? controller.allCards : []}
          currentCard={controller.currentCard ?? null}
          onSelectCard={(card) => {
            controller.setCardDirectly(card);
            setOverviewOpened(false);
          }}
        />

        <Modal
          opened={debouncedFinish}
          onClose={() => navigate("/home")}
          fullScreen
          closeOnClickOutside={false}
          closeOnEscape={false}
          withCloseButton={false}
          transitionProps={{ transition: "fade" }}
        >
          <FinishedLearningView
            statistics={controller.statistics}
            time={stopwatchResult}
            deckId={deck?.id}
          />
        </Modal>
      </Flex>
    </div>
  );
}

export default LearnView;
