"use client";
import { Box, Flex } from "@chakra-ui/react";
import { BrowserView, MobileView, isMobile, useMobileOrientation } from "react-device-detect";

import { Header } from "@/components";
import { useGame } from "@/stores/useGame";
import {
  EndedScreen,
  HomeScreen,
  LeaderboardScreen,
  RaceScreen,
  SelectionScreen,
} from "@/templates";

export default function Home() {
  const { screen } = useGame();
  const { isPortrait } = useMobileOrientation();

  return (
    <Flex flexDirection="column" minHeight="100vh">
      <Header />

      <Box as="main" flex={1}>
        {isMobile && isPortrait && (
          <div className="landscape-overlay">Please rotate your device to landscape mode.</div>
        )}

        <BrowserView className="game-container">
          {screen === "HOME" && <HomeScreen />}
          {screen === "SELECTION" && <SelectionScreen />}
          {screen === "RACE" && <RaceScreen />}
          {screen === "ENDED" && <EndedScreen />}
          {screen === "LEADERBOARD" && <LeaderboardScreen />}
        </BrowserView>

        <MobileView className="game-container">
          {screen === "HOME" && <HomeScreen />}
          {screen === "SELECTION" && <SelectionScreen />}
          {screen === "RACE" && <RaceScreen />}
          {screen === "ENDED" && <EndedScreen />}
          {screen === "LEADERBOARD" && <LeaderboardScreen />}
        </MobileView>
      </Box>
    </Flex>
  );
}
