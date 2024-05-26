"use client";

import { BrowserView, MobileView } from "react-device-detect";

import { CustomLayout } from "@/layout";
import { SelectionScreen } from "@/templates";

export default function Leaderboard() {
  return (
    <CustomLayout>
      <BrowserView className="game-container">
        <SelectionScreen />
      </BrowserView>

      <MobileView className="game-container">
        <SelectionScreen />
      </MobileView>
    </CustomLayout>
  );
}
