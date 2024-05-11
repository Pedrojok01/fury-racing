"use client";

import { BrowserView, MobileView } from "react-device-detect";

import { CustomLayout, LeaderboardScreen } from "@/templates";

export default function Leaderboard() {
  return (
    <CustomLayout>
      <BrowserView className="game-container">
        <LeaderboardScreen />
      </BrowserView>

      <MobileView className="game-container">
        <LeaderboardScreen />
      </MobileView>
    </CustomLayout>
  );
}
