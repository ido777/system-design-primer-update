import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import "mantine-datatable/styles.css";
import "./style/index.css";

import classes from "./App.module.css";
import { cssVariablesResolver, presetTheme } from "./style/StyleProvider";

import { AppShell, Center, MantineProvider, Stack } from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { useEffect, useRef } from "react";
import { I18nextProvider } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";
import WelcomeView from "./app/WelcomeView";
import LoginUI from "./app/login/LoginUI";
import Header from "./app/shell/Header/Header";
import Sidebar from "./app/shell/Sidebar/Sidebar";
import i18n from "./i18n";
import { useSetting } from "./logic/settings/hooks/useSetting";
import {
  resetAllSeedingState,
  resetSeedingState,
  seedSystemDesignDeck,
} from "./logic/seed/seedSystemDesignDeck";

function useRestoreLanguage() {
  const [language] = useSetting("language");
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return language;
}

export default function App() {
  const [colorSchemePreference] = useSetting("colorSchemePreference");
  useRestoreLanguage();
  const [sidebarMenuOpened, sidebarhandlers] = useDisclosure(false);

  const [registered] = useLocalStorage({
    key: "registered",
    defaultValue: false,
  });

  const routeIsLearn = useLocation().pathname.includes("learn");
  const hasSeededRef = useRef(false);

  useEffect(() => {
    if (routeIsLearn) {
      sidebarhandlers.close();
    } else {
      sidebarhandlers.open();
    }
  }, [routeIsLearn]);

  // Seed the system design deck on first run (only once, even with StrictMode)
  useEffect(() => {
    if (!hasSeededRef.current) {
      hasSeededRef.current = true;
      seedSystemDesignDeck();
    }
  }, []);

  // Expose seeding reset functions to window for console access
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).resetSeedingState = resetSeedingState;
      (window as any).resetAllSeedingState = resetAllSeedingState;
    }
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <MantineProvider
        defaultColorScheme={colorSchemePreference}
        cssVariablesResolver={cssVariablesResolver}
        theme={presetTheme}
      >
        <Notifications
          transitionDuration={400}
          containerWidth="20rem"
          position="bottom-center"
          autoClose={2000}
          limit={1}
        />
        {registered ? (
          <AppShell
            layout="alt"
            navbar={{
              width: { xs: "3.5rem", lg: 300 },
              breakpoint: "xs",
              collapsed: {
                mobile: !sidebarMenuOpened,
                desktop: !sidebarMenuOpened,
              },
            }}
            header={{ height: 60 }}
          >
            <Header
              menuOpened={sidebarMenuOpened}
              menuHandlers={sidebarhandlers}
            />
            <AppShell.Navbar>
              <Sidebar
                menuOpened={sidebarMenuOpened}
                menuHandlers={sidebarhandlers}
              />
            </AppShell.Navbar>

            <AppShell.Main>
              <Stack h="100%">
                <Center className={classes.main} p="md" h="100%" mih={0}>
                  <Outlet />
                </Center>
              </Stack>
            </AppShell.Main>
            <LoginUI />
          </AppShell>
        ) : (
          <WelcomeView />
        )}
      </MantineProvider>
    </I18nextProvider>
  );
}
