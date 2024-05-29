import type { FC } from "react";

import { Box, HStack, Link, Spacer, Text, useColorMode } from "@chakra-ui/react";
import Image, { type StaticImageData } from "next/image";
import Nextlink from "next/link";
import { isMobile } from "react-device-detect";
import { useAccount } from "wagmi";

import { networks } from "@/data/networks";
import styles from "@/templates/LeaderboardScreen/leaderboard.module.css";
import { getEllipsisTxt } from "@/utils/formatters";
import { getExplorer } from "@/utils/getExplorerByChain";

type ScoreItemProps = {
  user_address: `0x${string}`;
  score: number;
  index: number;
  image: StaticImageData | undefined;
};

const ScoreItem: FC<ScoreItemProps> = ({ user_address, score, index, image }) => {
  const { colorMode } = useColorMode();
  const { chainId, address } = useAccount();

  const isPlayer = address?.toLowerCase() === user_address.toLowerCase();

  const backgroundColor = isPlayer
    ? "var(--secondary-color)"
    : colorMode === "light"
      ? "var(--background-light)"
      : "var(--background-dark)";

  const fontWeight = isPlayer ? "bold" : "normal";

  return (
    <Box className={styles.scoreItem} style={{ backgroundColor: backgroundColor, fontWeight: fontWeight }}>
      <Box>{index}</Box>

      <HStack className={styles.userEmail} gap={3} w={"100%"} justifyContent={"center"}>
        {image ? (
          <Image src={image} alt="podium" width={isMobile ? 35 : 45} height={isMobile ? 35 : 45} />
        ) : (
          <Box width="50px" />
        )}

        <Link
          as={Nextlink}
          target="_blank"
          href={`${getExplorer(chainId ?? networks.avalanche.id)}/address/${user_address}`}
        >
          <Text>{isMobile ? (getEllipsisTxt(user_address, 6) as `0x${string}`) : user_address}</Text>
        </Link>
      </HStack>

      <Spacer />

      <Text className={styles.userScore}>{score} Points</Text>
    </Box>
  );
};

export default ScoreItem;
