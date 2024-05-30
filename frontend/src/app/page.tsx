"use client";
import { usePathname } from "next/navigation";
import { BrowserView, MobileView } from "react-device-detect";

import { CustomLayout } from "@/layout";
import { HomeScreen } from "@/templates";

export default function Home() {
  const pathname = usePathname();

  const isHome = pathname === "/";

  return (
    <>
      <CustomLayout>
        <BrowserView className="game-container" style={{ paddingLeft: isHome ? "8rem" : "0" }}>
          <HomeScreen />
        </BrowserView>

        <MobileView className="game-container">
          <HomeScreen />
        </MobileView>
      </CustomLayout>
    </>
  );
}
