import { useEffect, type FC } from "react";

import { Button, Center, HStack, VStack } from "@chakra-ui/react";

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
    <Center h={"100%"}>
      <VStack className={styles.leaderboard}>
        <h1 className={styles.leaderboardTitle}>LEADERBOARD</h1>

        {currentData.map((score, index) => (
          <ScoreItem
            key={score.id}
            user_address={score.address}
            score={score.score}
            index={index + 1}
            image={index === 0 ? images.crown : index < 3 ? images.podium : undefined}
          />
        ))}
        <HStack gap={2} mt={"15px"}>
          <Button onClick={prevPage} disabled={currentPage === 1} size="sm">
            Prev
          </Button>
          {Array.from({ length: pageCount }, (_, index) => (
            <Button key={index} onClick={() => changePage(index + 1)} disabled={currentPage === index + 1} size="sm">
              {index + 1}
            </Button>
          ))}
          <Button onClick={nextPage} disabled={currentPage === pageCount} size="sm">
            Next
          </Button>
        </HStack>
      </VStack>
    </Center>
  );
};

export default LeaderboardScreen;
