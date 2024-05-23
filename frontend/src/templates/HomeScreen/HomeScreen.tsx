import { type FC } from "react";

import { Box, Button, Center, Text, VStack, Link } from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
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
    <Center h={"100%"} className={styles.container} gap={5}>
      <VStack className={styles.subContainer}>
        <Text className={`${styles.title} text-shadow`}>
          Score the <span style={{ color: "var(--primary-color)" }}>best time</span>.
        </Text>

        <Text className={`${styles.title} text-shadow`}>
          Reach the top of the <span style={{ color: "var(--primary-color)" }}>leaderboard</span>.
        </Text>

        {isConnected && (
          <Link as={NextLink} href="/mode" style={{ textDecoration: "none" }}>
            <Button
              mt={"2rem"}
              paddingBlock={"2.5rem"}
              paddingInline={"5rem"}
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

      <Box className={styles.subContainer}>
        <Image src={images.homeCar.src} alt="car background" width={600} height={700} />
      </Box>
    </Center>
  );
};

export default HomeScreen;
