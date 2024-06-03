import { type FC } from "react";

import { Box, Button, Text, VStack, Link, Flex, useColorMode, Checkbox } from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { isMobile } from "react-device-detect";
import { useAccount } from "wagmi";

import { useAudio } from "@/context";
import { images } from "@/data/images";
import { useGameStates } from "@/stores";

import styles from "./home.module.css";

const HomeScreen: FC = () => {
  const { isConnected } = useAccount();
  const { audio, setAudio } = useAudio();
  const { reset } = useGameStates();
  const { colorMode } = useColorMode();

  const handlePlayClick = () => {
    reset();
  };

  return (
    <Flex className={styles.container}>
      <VStack className={styles.subContainer}>
        <Text className={`${styles.title} text-shadow`}>
          Score the <span style={{ color: "var(--primary-color)" }}>best time</span>.
        </Text>

        <Text
          className={`${styles.title} text-shadow`}
          style={{ backgroundColor: colorMode === "light" ? "rgba(255, 255, 255, 0.9)" : "", borderRadius: "12px" }}
        >
          Reach the top of the <span style={{ color: "var(--primary-color)" }}>leaderboard</span>.
        </Text>

        {isConnected && (
          <>
            <Link as={NextLink} href="/mode" style={{ textDecoration: "none" }} className="play">
              <Button
                mt={isMobile ? "0.5rem" : "2rem"}
                paddingBlock={isMobile ? "2.2rem" : "2.5rem"}
                paddingInline="5rem"
                fontSize={"2rem"}
                fontWeight={"bold"}
                className="custom-button"
                onClick={handlePlayClick}
              >
                Play
              </Button>
            </Link>

            <Checkbox mt={isMobile ? "0.25rem" : "0.5rem"} checked={audio} onChange={() => setAudio(!audio)}>
              Music enabled
            </Checkbox>
          </>
        )}
      </VStack>

      <Box className={styles.subContainer} flex={1}>
        <Image
          src={images.homeCar.src}
          alt="car background"
          width={isMobile ? 350 : 600}
          height={isMobile ? 408 : 700}
        />
      </Box>
    </Flex>
  );
};

export default HomeScreen;
