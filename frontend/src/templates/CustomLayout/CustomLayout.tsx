"use client";
import type { FC, ReactNode } from "react";

import { Box, Flex } from "@chakra-ui/react";
import { isMobile, useMobileOrientation } from "react-device-detect";


import { Header } from "@/components";

type CustomLayoutProps = {
  children: ReactNode;
};

const CustomLayout: FC<CustomLayoutProps> = ({ children }) => {
  const { isPortrait } = useMobileOrientation();
  return (
    <Flex flexDirection="column" minHeight="100vh" position="relative">
      {isMobile && isPortrait && (
        <div className="landscape-overlay">Please rotate your device to landscape mode.</div>
      )}

      <Header />

      <Box as="main" flex={1}>
        {children}
      </Box>
    </Flex>
  );
};

export default CustomLayout;
