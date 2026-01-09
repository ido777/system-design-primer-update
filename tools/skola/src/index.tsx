import App from "@/App";
import HomeView from "@/app/home/HomeView";
import { Center, Loader } from "@mantine/core";
import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createHashRouter } from "react-router-dom";

// Lazy load heavy components that aren't needed on first screen
const DeckView = React.lazy(() => import("@/app/deck/DeckView"));
const NewNotesView = React.lazy(() => import("@/app/editor/NewNotesView"));
const NoteExplorerView = React.lazy(() => import("@/app/explorer/NoteExplorerView"));
const LearnView = React.lazy(() => import("@/app/learn/LearnView/LearnView"));
const SettingsView = React.lazy(() => import("@/app/settings/SettingsView"));
const StatsView = React.lazy(() => import("@/app/statistics/StatsView"));
const TodayView = React.lazy(() => import("@/app/today/TodayView"));

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
const router = createHashRouter(
  [
    {
      element: <App />,
      children: [
        {
          index: true,
          element: <Navigate to="/home" replace={true} />,
        },
        {
          path: "/home",
          element: <HomeView />,
        },
        {
          path: "/settings/:section?",
          element: <SettingsView />,
        },
        {
          path: "/deck/:deckId",
          element: <DeckView />,
        },
        {
          path: "/deck/:deckId/:params",
          element: <DeckView />,
        },
        {
          path: "/new/:deckId?",
          element: <NewNotesView />,
        },
        {
          path: "/learn/:deckId/:params?",
          element: <LearnView />,
        },
        {
          path: "/notes/:deckId?",
          element: <NoteExplorerView />,
        },
        {
          path: "/today",
          element: <TodayView />,
        },
        {
          path: "/stats/:deckId?",
          element: <StatsView />,
        },
      ],
    },
  ],
  { basename: "/" }
);

root.render(
  <React.StrictMode>
    <React.Suspense
      fallback={
        <Center h="100vh">
          <Loader />
        </Center>
      }
    >
      <RouterProvider router={router} />
    </React.Suspense>
  </React.StrictMode>
);

navigator.serviceWorker.getRegistrations().then((registrations) => {
  for (const registration of registrations) {
    registration.unregister();
  }
});

async function persist() {
  return (
    navigator.storage &&
    navigator.storage.persist &&
    navigator.storage.persist()
  );
}

async function isStoragePersisted() {
  return (
    (await navigator.storage) &&
    navigator.storage.persisted &&
    navigator.storage.persisted()
  );
}

isStoragePersisted().then(async (isPersisted) => {
  if (!isPersisted) {
    console.warn("Storage is not persistant. Trying to make it persistant...");
    if (await persist()) {
      console.log("Successfully made storage persisted");
    } else {
      console.warn("Failed to make storage persisted");
      navigator.userAgent.includes("Safari") &&
        console.info(
          "You are using Safari, storage may be cleared after 7 days of inactivity: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/"
        );
    }
  }
});
