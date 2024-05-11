import type { FC } from "react";

import { Box, HStack, Link, Spacer, Text, useColorMode } from "@chakra-ui/react";
import Image, { type StaticImageData } from "next/image";
import Nextlink from "next/link";
import { useAccount } from "wagmi";

import { networks } from "@/data/networks";
import styles from "@/templates/LeaderboardScreen/leaderboard.module.css";
import { getExplorer } from "@/utils/getExplorerByChain";

type ScoreItemProps = {
  user_address: `0x${string}`;
  score: number;
  index: number;
  image: StaticImageData | undefined;
};

const ScoreItem: FC<ScoreItemProps> = ({ user_address, score, index, image }) => {
  const { colorMode } = useColorMode();
  const { chainId } = useAccount();

  const backgroundColor =
    colorMode === "light" ? "var(--background-light)" : "var(--background-dark)";

  return (
    <Box className={styles.scoreItem} style={{ backgroundColor: backgroundColor }}>
      <Box>{index}</Box>

      <HStack className={styles.userEmail} gap={3} w={"100%"} justifyContent={"center"}>
        {image ? <Image src={image} alt="podium" width={50} height={50} /> : <Box width="50px" />}

        <Link
          as={Nextlink}
          target="_blank"
          href={`${getExplorer(chainId ?? networks.avalanche.id)}/address/${user_address}`}
        >
          <Text>{user_address}</Text>
        </Link>
      </HStack>

      <Spacer />

      <Text className={styles.userScore}>{score} ELO</Text>
    </Box>
  );
};

export default ScoreItem;
