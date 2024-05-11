import { type FC } from "react";

import { Box, Button, Center, HStack, Text, VStack, Link } from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { useAccount } from "wagmi";

import styles from "./home.module.css";
import homeCar from "../../../public/img/home-car.png";

const HomeScreen: FC = () => {
  const { isConnected } = useAccount();

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

        {isConnected && (
          <Link as={NextLink} href="/selection" m={"auto"} style={{ textDecoration: "none" }}>
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
        <Image src={homeCar.src} alt="car background" width={600} height={700} />
      </Box>
    </Center>
  );
};

export default HomeScreen;
