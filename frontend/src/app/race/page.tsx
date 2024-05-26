"use client";

import { BrowserView, MobileView } from "react-device-detect";

import { CustomLayout } from "@/layout";
import { RaceScreen } from "@/templates";

export default function Race() {
  return (
    <CustomLayout>
      <BrowserView className="game-container">
        <RaceScreen />
      </BrowserView>

      <MobileView className="game-container">
        <RaceScreen />
      </MobileView>
    </CustomLayout>
  );
}
