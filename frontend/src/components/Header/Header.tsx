"use client";
import { type FC } from "react";

import { Box, Center, HStack, Link, useColorMode } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import NextLink from "next/link";
import { useAccount } from "wagmi";

import { images } from "@/data";
import { useWindowSize } from "@/hooks";
import { useAudio } from "@/stores/useAudio";
import { useContract } from "@/stores/useContract";

import styles from "./header.module.css";
import { DarkModeButton } from "../DarkModeButton";

const Header: FC = () => {
  const { isSmallScreen } = useWindowSize();
  const { isConnected } = useAccount();
  const { colorMode } = useColorMode();
  const { reset } = useContract();
  const { setAudio } = useAudio();

  const handlePlayClick = () => {
    reset();
    setAudio(true);
  };

  const menuIems = (
    <Center gap={3}>
      <Link as={NextLink} href="/mode" className={styles.menuItems} onClick={handlePlayClick}>
        <Box>New Game</Box>
      </Link>
      <Link as={NextLink} href="/leaderboard" className={styles.menuItems}>
        <Box>Leaderboard</Box>
      </Link>
    </Center>
  );

  return (
    <Box as="header" flex={3}>
      <HStack paddingInline={"1rem"} position="sticky" top={0} zIndex={10} justifyContent={"left"}>
        <Link as={NextLink} href="/" textDecoration={"none"} w={"100%"} justifyContent={"left"}>
          <HStack>
            <Image
              src={colorMode === "light" ? images.logo.src : images.logo_black.src}
              alt="logo"
              width={180}
              height={81}
            />
          </HStack>
        </Link>

        {!isSmallScreen && isConnected && (
          <HStack justifyContent={"center"} w={"100%"}>
            {menuIems}{" "}
          </HStack>
        )}

        <HStack justifyContent={"right"} w={"100%"}>
          <ConnectButton />
          <DarkModeButton />
        </HStack>
      </HStack>

      {isSmallScreen && isConnected && menuIems}
    </Box>
  );
};

export default Header;
