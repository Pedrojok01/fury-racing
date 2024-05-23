import { useEffect, type FC } from "react";

import { Center, VStack } from "@chakra-ui/react";
import { useAccount } from "wagmi";

import { CarRace, ResultModal } from "@/components";
import { useReadContract } from "@/hooks";
import { useGameStates } from "@/stores/useGameStates";

const RaceScreen: FC = () => {
  const { address } = useAccount();
  const { raceId, raceInfo } = useGameStates();
  const { getRaceInfo } = useReadContract();

  useEffect(() => {
    if (!raceId) return;

    const interval = setInterval(async () => {
      await getRaceInfo(raceId);
    }, 20000); // 20 seconds interval

    return () => clearInterval(interval); // Clear interval if component unmounts
  }, [raceId, getRaceInfo]);

  const hasRaceFinished = raceInfo && raceInfo.player1Time !== 0;
  const isWinner =
    address &&
    hasRaceFinished &&
    ((address === raceInfo.player1 && raceInfo.player1Time < raceInfo.player2Time) ||
      (address === raceInfo.player2 && raceInfo.player2Time < raceInfo.player1Time));

  return (
    <>
      <Center h={"100%"}>
        <VStack align="center" justify="center">
          <CarRace />
        </VStack>
      </Center>

      {hasRaceFinished && <ResultModal raceInfo={raceInfo} isWinner={!!isWinner} />}
    </>
  );
};

export default RaceScreen;
