import { useEffect, type FC } from "react";

import { Button, Center, HStack, VStack } from "@chakra-ui/react";

import { ScoreItem } from "@/components";
import { mockLeaderboard } from "@/data/mockLeaderboard";
import usePagination from "@/hooks/usePagination";

import styles from "./leaderboard.module.css";
import crown from "../../../public/img/crown.png";
import podium from "../../../public/img/podium.png";

const LeaderboardScreen: FC = () => {
  const { currentData, currentPage, pageCount, changePage, nextPage, prevPage, setDataset } =
    usePagination([], 10);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        // const response = await api.get("/getscores");
        // setScores(response.data);
        setDataset(mockLeaderboard);
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };

    fetchScores();
  }, [setDataset]);

  return (
    <Center h={"100%"}>
      <VStack className={styles.leaderboard}>
        <h1 className={styles.leaderboardTitle}>LEADERBOARD</h1>

        {currentData.map((score, index) => (
          <ScoreItem
            key={score._id}
            user_address={score.user_address}
            score={score.score}
            index={index + 1}
            image={index === 0 ? crown : index < 3 ? podium : undefined}
          />
        ))}
        <HStack gap={2} mt={"15px"}>
          <Button onClick={prevPage} disabled={currentPage === 1} size="sm">
            Prev
          </Button>
          {Array.from({ length: pageCount }, (_, index) => (
            <Button
              key={index}
              onClick={() => changePage(index + 1)}
              disabled={currentPage === index + 1}
              size="sm"
            >
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
