"use client";
import type { FC, ReactNode } from "react";

import { Box, Flex, Image } from "@chakra-ui/react";
import { isMobile, useMobileOrientation } from "react-device-detect";

import { Footer, Header } from "@/components";
import { images } from "@/data/images";
import { useGame } from "@/stores/useGame";

type CustomLayoutProps = {
  children: ReactNode;
};

const CustomLayout: FC<CustomLayoutProps> = ({ children }) => {
  const { isPortrait } = useMobileOrientation();
  const { screen } = useGame();

  const displayRoadBg = screen === "HOME" || screen === "LEADERBOARD";

  return (
    <Flex flexDirection="column" minHeight="100vh" position="relative">
      {isMobile && isPortrait && (
        <div className="landscape-overlay">Please rotate your device to landscape mode.</div>
      )}

      <Header />

      <Box as="main" flex={1}>
        {children}
      </Box>

      {displayRoadBg && (
        <Box position="absolute" bottom="0" left="0" zIndex={-10}>
          <Image
            alt="background shape"
            src={images.road.src}
            width={350}
            height={"auto"}
            rotate={"10deg"}
          />
        </Box>
      )}

      <Footer />
    </Flex>
  );
};

export default CustomLayout;
