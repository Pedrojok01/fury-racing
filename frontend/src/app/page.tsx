"use client";
import { BrowserView, MobileView } from "react-device-detect";

import { CustomLayout } from "@/layout";
import { HomeScreen } from "@/templates";

export default function Home() {
  return (
    <>
      <CustomLayout>
        <BrowserView className="game-container">
          <HomeScreen />
        </BrowserView>

        <MobileView className="game-container">
          <HomeScreen />
        </MobileView>
      </CustomLayout>
    </>
  );
}
