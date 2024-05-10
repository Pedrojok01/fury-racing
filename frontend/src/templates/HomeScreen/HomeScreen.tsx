import { type FC } from "react";

import { Box, Button, Center, HStack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";

import { useGame } from "@/stores/useGame";

import styles from "./home.module.css";
import homeCar from "../../../public/img/home-car.png";


const HomeScreen: FC = () => {
  const { setScreen } = useGame();

  return (
    <Center h={"100%"} className={styles.container}>
      <VStack className={styles.subContainer}>
        <HStack>
          <Text className={`${styles.title} text-shadow`}>
            Score the <span style={{ color: "var(--primary-color)" }}>best time</span>.
          </Text>
        </HStack>

        <HStack>
          <Text className={`${styles.title} text-shadow`}>
            Reach the top of the <span style={{ color: "var(--primary-color)" }}>leaderboard</span>.
          </Text>
        </HStack>

        <Button m={"auto"} onClick={() => setScreen("SELECTION")} className="custom-button">
          Play
        </Button>
      </VStack>

      <Box className={styles.subContainer}>
        <Image src={homeCar.src} alt="car background" width={600} height={700} />
      </Box>
    </Center>
  );
};

export default HomeScreen;
