"use client";
import { type FC } from "react";

import { Box, Center, HStack, Heading, Link } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import NextLink from "next/link";
import { useAccount } from "wagmi";

import { TITLE } from "@/data/constants";
import { useWindowSize } from "@/hooks";
import { useGame } from "@/stores/useGame";

import styles from "./header.module.css";
import logo from "../../../public/img/logo.png";
import { DarkModeButton } from "../DarkModeButton";

const Header: FC = () => {
  const { isSmallScreen } = useWindowSize();
  const { isConnected } = useAccount();
  const { setScreen } = useGame();

  const menuIems = (
    <Center gap={3}>
      <Link
        as={NextLink}
        href="/selection"
        className={styles.menuItems}
        onClick={() => setScreen("SELECTION")}
      >
        <Box>New Game</Box>
      </Link>
      <Link
        as={NextLink}
        href="/leaderboard"
        className={styles.menuItems}
        onClick={() => setScreen("LEADERBOARD")}
      >
        <Box>Leaderboard</Box>
      </Link>
    </Center>
  );

  return (
    <Box as="header" flex={3}>
      <HStack p={"1rem"} position="sticky" top={0} zIndex={10} justifyContent={"left"}>
        <Link
          as={NextLink}
          href="/"
          textDecoration={"none"}
          w={"100%"}
          justifyContent={"left"}
          onClick={() => setScreen("HOME")}
        >
          <HStack>
            <Image src={logo.src} alt="logo" width={45} height={45} />

            <Heading as="h1" fontSize={"1.5rem"} pb={"0.3rem"} className="text-shadow">
              {TITLE}
            </Heading>
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
