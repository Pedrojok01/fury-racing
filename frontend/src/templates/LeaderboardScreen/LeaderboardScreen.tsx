import { useEffect, type FC } from "react";

import { Button, Center, HStack, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { isMobile } from "react-device-detect";

import { ScoreItem } from "@/components";
import { images } from "@/data/images";
import { usePagination } from "@/hooks";
import useLeaderboard from "@/hooks/useLeaderboard";

import styles from "./leaderboard.module.css";

const LeaderboardScreen: FC = () => {
  const { leaderboard } = useLeaderboard();
  const { currentData, currentPage, pageCount, changePage, nextPage, prevPage, setDataset } = usePagination([], 10);

  useEffect(() => {
    if (leaderboard && leaderboard.length > 0) {
      setDataset(leaderboard);
    }
  }, [leaderboard, setDataset]);

  return (
    <Center h={"inherit"}>
      <VStack className={styles.leaderboard}>
        <h1 className={styles.leaderboardTitle}>LEADERBOARD</h1>

        <HStack justifyContent={"space-between"} w={"100%"} paddingInline="1.5rem 3.8rem">
          <Image src={images.podium.src} alt="podium" width={isMobile ? 35 : 45} height={isMobile ? 35 : 45} />
          <Image src={images.star.src} alt="star" width={isMobile ? 35 : 45} height={isMobile ? 35 : 45} />
        </HStack>

        {currentData.map((score, index) => (
          <ScoreItem
            key={score.id}
            user_address={score.address}
            score={score.score}
            index={index + 1}
            image={index === 0 ? images.crown : undefined}
          />
        ))}
        <HStack gap={2} mt={"15px"}>
          <Button
            onClick={prevPage}
            disabled={currentPage === 1}
            size="sm"
            width="60px"
            variant="surface"
            rounded="6px"
          >
            Prev
          </Button>
          {Array.from({ length: pageCount }, (_, index) => (
            <Button key={index} onClick={() => changePage(index + 1)} disabled={currentPage === index + 1} size="sm">
              {index + 1}
            </Button>
          ))}
          <Button
            onClick={nextPage}
            disabled={currentPage === pageCount}
            size="sm"
            width="60px"
            variant="surface"
            rounded="6px"
          >
            Next
          </Button>
        </HStack>
      </VStack>
    </Center>
  );
};

export default LeaderboardScreen;
