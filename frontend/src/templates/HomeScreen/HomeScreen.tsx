import { type FC } from "react";

import { Box, Button, Center, Text, VStack, Link } from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { useAccount } from "wagmi";

import { images } from "@/data/images";
import { useGame } from "@/stores/useGame";

import styles from "./home.module.css";

const HomeScreen: FC = () => {
  const { isConnected } = useAccount();
  const { setScreen } = useGame();

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
          <Link
            as={NextLink}
            href="/mode"
            style={{ textDecoration: "none" }}
            onClick={() => setScreen("MODE")}
          >
            <Button
              mt={"2rem"}
              paddingBlock={"2.5rem"}
              paddingInline={"5rem"}
              fontSize={"2rem"}
              fontWeight={"bold"}
              className="custom-button"
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
