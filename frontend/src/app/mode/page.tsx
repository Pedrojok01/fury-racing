"use client";

import { BrowserView, MobileView } from "react-device-detect";

import { CustomLayout, ModeScreen } from "@/templates";

export default function Mode() {
  return (
    <CustomLayout>
      <BrowserView className="game-container">
        <ModeScreen />
      </BrowserView>

      <MobileView className="game-container">
        <ModeScreen />
      </MobileView>
    </CustomLayout>
  );
}
