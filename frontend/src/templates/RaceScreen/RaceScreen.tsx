import { useEffect, type FC } from "react";

import { Center, VStack } from "@chakra-ui/react";
import { useAccount } from "wagmi";

import { CarRace, ResultModal } from "@/components";
import { useReadContract } from "@/hooks";
import { useGameStates } from "@/stores";

const RaceScreen: FC = () => {
  const { address } = useAccount();
  const { raceId, raceInfo, mode } = useGameStates();
  const { getRaceInfo } = useReadContract();

  useEffect(() => {
    if (!raceId || !mode) return;

    const interval = setInterval(async () => {
      await getRaceInfo(raceId, mode);
    }, 30000); // 30 seconds interval

    return () => clearInterval(interval);
  }, [raceId, getRaceInfo, mode]);

  const hasRaceFinished = raceInfo && raceInfo.player1Time !== 0 && raceInfo.player2Time !== 0;
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

      {hasRaceFinished && <ResultModal raceInfo={raceInfo} isWinner={!!isWinner} mode={mode ?? "SOLO"} />}
    </>
  );
};

export default RaceScreen;
