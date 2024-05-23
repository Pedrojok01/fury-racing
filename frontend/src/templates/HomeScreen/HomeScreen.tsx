import { type FC } from "react";

import { Box, Button, Text, VStack, Link, Flex } from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { isMobile } from "react-device-detect";
import { useAccount } from "wagmi";

import { images } from "@/data/images";
import { useAudio } from "@/stores/useAudio";
import { useGameStates } from "@/stores/useGameStates";

import styles from "./home.module.css";

const HomeScreen: FC = () => {
  const { isConnected } = useAccount();
  const { setAudio } = useAudio();
  const { reset } = useGameStates();

  const handlePlayClick = () => {
    reset();
    setAudio(true);
  };

  return (
    <Flex h={"100%"} className={styles.container} gap={5} alignItems={"center"}>
      <VStack className={styles.subContainer} flex={1}>
        <Text className={`${styles.title} text-shadow`}>
          Score the <span style={{ color: "var(--primary-color)" }}>best time</span>.
        </Text>

        <Text className={`${styles.title} text-shadow`}>
          Reach the top of the <span style={{ color: "var(--primary-color)" }}>leaderboard</span>.
        </Text>

        {isConnected && (
          <Link as={NextLink} href="/mode" style={{ textDecoration: "none" }}>
            <Button
              mt={isMobile ? "0.5rem" : "2rem"}
              paddingBlock={isMobile ? "2.2rem" : "2.5rem"}
              paddingInline={isMobile ? "5rem" : "5rem"}
              fontSize={"2rem"}
              fontWeight={"bold"}
              className="custom-button"
              onClick={handlePlayClick}
            >
              Play
            </Button>
          </Link>
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
