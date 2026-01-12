import { Table } from "dexie";
import { Rating, SchedulingInfo, State } from "fsrs.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  updateGlobalScheduler,
  useGlobalScheduler,
} from "./card/CardScheduler";
import { Card } from "./card/card";
import { useCardsWith } from "./card/hooks/useCardsWith";
import { updateCardModel } from "./card/updateCardModel";
import { NoteType } from "./note/note";
import { DeckStatistics, newStatistics } from "./statistics";

export type LearnOptions = {
  learnAll: boolean;
  newToReviewRatio: number;
  sort?: (a: Card<NoteType>, b: Card<NoteType>) => number;
};

export type CardQuerier = {
  querier: (
    cards: Table<Card<NoteType>>
  ) => Promise<Card<NoteType>[] | undefined>;
  dependencies: any[];
};

export type LearnController = {
  newCardsNumber: number;
  timeCriticalCardsNumber: number;
  toReviewCardsNumber: number;
  learnedCardsNumber: number;

  currentCard: Card<NoteType> | null;
  currentCardRepeatInfo: Record<number, SchedulingInfo> | null;

  showingAnswer: boolean;
  showAnswer: () => void;

  answerCard: (rating: Rating) => void;
  requestNextCard: () => void;
  requestPreviousCard: () => void;
  setCardDirectly: (card: Card<NoteType>) => void;

  allCards: Card<NoteType>[];
  cardHistory: Card<NoteType>[];

  statistics: DeckStatistics;
  isFinished: boolean;

  options: LearnOptions;
};

export function useLearning(
  cardQuerier: CardQuerier,
  options: LearnOptions
): LearnController {
  //e.g. all cards of a deck
  const [providedCards] = useCardsWith(
    cardQuerier.querier,
    cardQuerier.dependencies
  );

  const scheduler = useGlobalScheduler();

  //Time critical cards are cards that are due today / should be done within this learning session (5-10 min interval). timeCriticalCards should be sorted by due date
  const [timeCriticalCards, setTimeCriticalCards] = useState<Card<NoteType>[]>(
    []
  );

  //New cards are cards that have never been reviewed
  const [newCards, setNewCards] = useState<Card<NoteType>[]>([]);
  //To review cards are cards that have been answered correctly before and are due for a review
  const [toReviewCards, setToReviewCards] = useState<Card<NoteType>[]>([]);
  //Learned cards are cards that have been answered correctly but are not due for a review. These cards are not regulary shown, only with learnAll true
  const [learnedCards, setLearnedCards] = useState<Card<NoteType>[]>([]);

  //Currently shown card
  const [currentCard, setCurrentCard] = useState<Card<NoteType> | null>(null);
  
  //Card history for navigation (previous cards)
  const [cardHistory, setCardHistory] = useState<Card<NoteType>[]>([]);
  
  //All cards in current session (for overview)
  const [allSessionCards, setAllSessionCards] = useState<Card<NoteType>[]>([]);

  const [showingAnswer, setShowingAnswer] = useState<boolean>(false);
  //Used so that nextCard isn't called immediately but only after state has been updated
  const [requestedNextCard, setRequestedNextCard] = useState<boolean>(false);
  const [requestedPreviousCard, setRequestedPreviousCard] = useState<boolean>(false);

  //Determines if FinishedLearningView is shown
  const [isFinished, setIsFinished] = useState<boolean>(false);
  //for progress bar and statistics on FinishedLearningView
  const [statistics, setStatistics] = useState<DeckStatistics>(() =>
    newStatistics()
  );

  useEffect(() => {
    //Check if there are already cards provided
    if (providedCards) {
      // Initialize all session cards with all provided cards
      setAllSessionCards(providedCards);
      
      //Check if there are no cards are in the respective lists and currentCard is not set.
      if (
        timeCriticalCards.length +
          newCards.length +
          toReviewCards.length +
          learnedCards.length ===
          0 &&
        currentCard === null
      ) {
        //If yes, sort the cards into the respective lists
        const now = new Date(Date.now());
        setTimeCriticalCards(
          providedCards.filter(
            (card) =>
              card.model.state === State.Learning ||
              card.model.state === State.Relearning
          )
        );
        setNewCards(
          providedCards
            .filter((card) => card.model.state === State.New)
            .sort(options.sort)
        );
        setToReviewCards(
          providedCards
            .filter(
              (card) =>
                card.model.state === State.Review && card.model.due <= now
            )
            .sort(options.sort)
        );
        setLearnedCards(
          providedCards
            .filter(
              (card) =>
                card.model.state === State.Review && card.model.due > now
            )
            .sort(options.sort)
        );
      } else if (currentCard === null) {
        //If currentCard is not set (and there are cards in the lists), set it
        nextCard();
      }
    }
  }, [
    providedCards,
    currentCard,
    timeCriticalCards,
    newCards,
    toReviewCards,
    learnedCards,
    options,
  ]);

  //Tries to set currentCard to the next card
  const nextCard = useCallback(() => {
    if (isFinished) {
      return;
    }
    
    // Add current card to history before moving
    if (currentCard) {
      setCardHistory((prev) => [...prev, currentCard]);
      setAllSessionCards((prev) => {
        if (!prev.find((c) => c.id === currentCard.id)) {
          return [...prev, currentCard];
        }
        return prev;
      });
    }
    
    //If there are time critical cards that are due, set the first one as currentCard
    if (
      timeCriticalCards.length > 0 &&
      timeCriticalCards[0].model.due <= new Date(Date.now())
    ) {
      const next = timeCriticalCards[0];
      setCurrentCard(next);
      setTimeCriticalCards((tcCards) => tcCards.filter((_, i) => i !== 0));
      setAllSessionCards((prev) => {
        if (!prev.find((c) => c.id === next.id)) {
          return [...prev, next];
        }
        return prev;
      });
      //If there are new cards or cards that need to be reviewed are available choose one of them based on the newToReviewRatio
    } else if (newCards.length + toReviewCards.length > 0) {
      let next: Card<NoteType>;
      if (newCards.length === 0) {
        next = toReviewCards[0];
        setCurrentCard(next);
        setToReviewCards((trCards) => trCards.filter((_, i) => i !== 0));
      } else if (toReviewCards.length === 0) {
        next = newCards[0];
        setCurrentCard(next);
        setNewCards((nCards) => nCards.filter((_, i) => i !== 0));
      } else {
        if (Math.random() < options.newToReviewRatio) {
          next = newCards[0];
          setCurrentCard(next);
          setNewCards((nCards) => nCards.filter((_, i) => i !== 0));
        } else {
          next = toReviewCards[0];
          setCurrentCard(next);
          setToReviewCards((trCards) => trCards.filter((_, i) => i !== 0));
        }
      }
      setAllSessionCards((prev) => {
        if (!prev.find((c) => c.id === next.id)) {
          return [...prev, next];
        }
        return prev;
      });
      //If learnAll is true and there are learned cards available set the first one as currentCard
    } else if (options.learnAll && learnedCards.length > 0) {
      const next = learnedCards[0];
      setCurrentCard(next);
      setLearnedCards((lCards) => lCards.filter((_, i) => i !== 0));
      setAllSessionCards((prev) => {
        if (!prev.find((c) => c.id === next.id)) {
          return [...prev, next];
        }
        return prev;
      });
      //If there aren't any other cards but still time critical cards which are not due yet do them anyway
    } else if (timeCriticalCards.length > 0) {
      const next = timeCriticalCards[0];
      setCurrentCard(next);
      setTimeCriticalCards((tcCards) => tcCards.filter((_, i) => i !== 0));
      setAllSessionCards((prev) => {
        if (!prev.find((c) => c.id === next.id)) {
          return [...prev, next];
        }
        return prev;
      });
      //If there are no cards left finish the learning session
    } else {
      setIsFinished(true);
      updateGlobalScheduler();
    }
    setShowingAnswer(false);
  }, [timeCriticalCards, newCards, toReviewCards, learnedCards, options, currentCard]);

  //Go to previous card from history
  const previousCard = useCallback(() => {
    if (cardHistory.length > 0) {
      const prev = cardHistory[cardHistory.length - 1];
      setCardHistory((prevHistory) => prevHistory.slice(0, -1));
      
      // Put current card back into appropriate queue
      if (currentCard) {
        const now = new Date(Date.now());
        if (
          currentCard.model.state === State.Learning ||
          currentCard.model.state === State.Relearning
        ) {
          setTimeCriticalCards((tc) => [currentCard, ...tc].sort((a, b) => a.model.due.getTime() - b.model.due.getTime()));
        } else if (currentCard.model.state === State.New) {
          setNewCards((nc) => [currentCard, ...nc].sort(options.sort || (() => 0)));
        } else if (currentCard.model.state === State.Review && currentCard.model.due <= now) {
          setToReviewCards((tr) => [currentCard, ...tr].sort(options.sort || (() => 0)));
        } else if (currentCard.model.state === State.Review && currentCard.model.due > now) {
          setLearnedCards((lc) => [currentCard, ...lc].sort(options.sort || (() => 0)));
        }
      }
      
      setCurrentCard(prev);
      setShowingAnswer(false);
    }
  }, [cardHistory, currentCard, options]);

  useEffect(() => {
    if (requestedNextCard) {
      nextCard();
      setRequestedNextCard(false);
    }
  }, [requestedNextCard, nextCard]);

  useEffect(() => {
    if (requestedPreviousCard) {
      previousCard();
      setRequestedPreviousCard(false);
    }
  }, [requestedPreviousCard, previousCard]);

  //Providing information about how all 4 ratings would affect the current card
  //Shown on buttons
  const currentCardRepeatInfo = useMemo(() => {
    if (currentCard) {
      return scheduler.repeat(currentCard.model, new Date(Date.now()));
    } else {
      return null;
    }
  }, [currentCard]);

  //Answering the current card with the given rating
  const answer = useCallback(
    (rating: Rating) => {
      if (currentCard && currentCardRepeatInfo) {
        //Don't update the card if it is already learned and not due for a review
        if (
          !(
            currentCard.model.state === State.Review &&
            currentCard.model.due.getTime() >= Date.now()
          )
        ) {
          updateCardModel(
            currentCard,
            currentCardRepeatInfo[rating].card,
            currentCardRepeatInfo[rating].review_log
          );
        }
        if (currentCardRepeatInfo[rating].card.scheduled_days === 0) {
          setTimeCriticalCards((tcCards) =>
            [
              ...tcCards,
              { ...currentCard, model: currentCardRepeatInfo[rating].card },
            ].sort((a, b) => a.model.due.getTime() - b.model.due.getTime())
          );
        }
        setStatistics((ds) => {
          return {
            ...ds,
            ratingsList: [...ds.ratingsList, rating],
            cards: {
              ...ds.cards,
              [currentCard.model.state]: ds.cards[currentCard.model.state] + 1,
            },
          };
        });
      } else {
        throw new Error("Card or cardModelInfo is missing");
      }
      setShowingAnswer(false);
    },
    [currentCard, currentCardRepeatInfo, timeCriticalCards, statistics]
  );

  // Function to directly set a card (for overview selection)
  const setCardDirectly = useCallback(
    (card: Card<NoteType>) => {
      if (currentCard) {
        setCardHistory((prev) => [...prev, currentCard]);
      }
      setCurrentCard(card);
      setShowingAnswer(false);
      // Remove card from appropriate queue if it's there
      setTimeCriticalCards((tc) => tc.filter((c) => c.id !== card.id));
      setNewCards((nc) => nc.filter((c) => c.id !== card.id));
      setToReviewCards((tr) => tr.filter((c) => c.id !== card.id));
      setLearnedCards((lc) => lc.filter((c) => c.id !== card.id));
    },
    [currentCard]
  );

  return {
    newCardsNumber: newCards.length,
    timeCriticalCardsNumber: timeCriticalCards.length,
    toReviewCardsNumber: toReviewCards.length,
    learnedCardsNumber: learnedCards.length,

    currentCard: currentCard,
    currentCardRepeatInfo: currentCardRepeatInfo,

    showingAnswer: showingAnswer,
    showAnswer: setShowingAnswer.bind(null, true),

    answerCard: answer,
    requestNextCard: setRequestedNextCard.bind(null, true),
    requestPreviousCard: setRequestedPreviousCard.bind(null, true),
    setCardDirectly: setCardDirectly,

    allCards: allSessionCards,
    cardHistory: cardHistory,

    statistics: statistics,
    isFinished: isFinished,

    options: options,
  };
}

export function useRepetitionAccuracy(ratingsList: number[]): number {
  return useMemo(() => {
    if (ratingsList.length !== 0) {
      let sum = 0;
      ratingsList.forEach((rating) => {
        return (sum += (rating - 1) / 2);
      });
      return Math.round((sum / ratingsList.length) * 1000) / 10;
    } else {
      return Number.NaN;
    }
  }, [ratingsList]);
}
