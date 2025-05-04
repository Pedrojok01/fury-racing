"use client";
import { type FC } from "react";

import { Box, HStack, IconButton, Link, Menu, Portal } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import NextLink from "next/link";
import { useTheme } from "next-themes";
import { isMobile } from "react-device-detect";
import { FiMenu } from "react-icons/fi";
import { useAccount } from "wagmi";

import { DarkModeButton, FullScreenButton } from "@/components";
import { GITBOOK, images } from "@/data";
import { useWindowSize } from "@/hooks";
import { useGameStates } from "@/stores";
import { t } from "@/utils/i18";

import styles from "./header.module.css";

const Header: FC = () => {
  const { isConnected, address } = useAccount();
  const { theme } = useTheme();
  const { reset } = useGameStates();
  const { width } = useWindowSize();

  const handlePlayClick = () => {
    reset();
  };

  const menuIems = (
    <>
      <NextLink href="/mode" className={styles.menuItems} onClick={handlePlayClick}>
        <Box className="text-shadow">{t("menu.play")}</Box>
      </NextLink>
      <NextLink href="/leaderboard" className={`${styles.menuItems} leaderboard`}>
        <Box className="text-shadow">{t("menu.leaderboard")}</Box>
      </NextLink>
      <Link href={GITBOOK} className={styles.menuItems} rel="noopener noreferrer">
        <Box className="text-shadow">{t("menu.doc")}</Box>
      </Link>
    </>
  );

  return (
    <Box as="header">
      {!isMobile && (
        <HStack paddingInline={"1rem"} position="sticky" top={0} zIndex={10} justifyContent={"left"}>
          <Link as={NextLink} href="/" textDecoration={"none"} w={"100%"} justifyContent={"left"}>
            <HStack>
              <Image
                src={theme === "light" ? images.logo.src : images.logo_black.src}
                alt="logo"
                width={width < 1200 ? 160 : 180}
                height={width < 1200 ? 72 : 81}
              />
            </HStack>
          </Link>

          {isConnected && (
            <HStack justifyContent={"center"} w={"100%"} gap={3}>
              {menuIems}{" "}
            </HStack>
          )}

          <HStack justifyContent={"right"} w={"100%"}>
            {!isConnected && !address && <Box h={0} className="connect-wallet" />}
            <ConnectButton />
            <FullScreenButton />
            <DarkModeButton />
          </HStack>
        </HStack>
      )}

      {isMobile && (
        <HStack paddingInline={"1rem"} position="sticky" top={0} zIndex={10} justifyContent={"left"}>
          <Link as={NextLink} href="/" textDecoration={"none"} w={"100%"} justifyContent={"left"}>
            <Image
              src={theme === "light" ? images.logo.src : images.logo_black.src}
              alt="logo"
              width={120}
              height={54}
            />
          </Link>

          {isConnected && (
            <HStack justifyContent={"center"} w={"100%"}>
              {menuIems}{" "}
            </HStack>
          )}

          <HStack justifyContent={"right"} w={"100%"}>
            {!isConnected ? (
              <>
                <ConnectButton />
                <DarkModeButton />
              </>
            ) : (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <IconButton className="menu-button" aria-label="Options" variant="outline" borderRadius={"12px"}>
                    <FiMenu />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content p={2}>
                      <HStack gap={10} justify="center" marginBlock={1}>
                        <ConnectButton /> <FullScreenButton /> <DarkModeButton />
                      </HStack>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            )}
          </HStack>
        </HStack>
      )}
    </Box>
  );
};

export default Header;
