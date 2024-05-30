import { useEffect, type FC } from "react";

import { Center, VStack } from "@chakra-ui/react";
import { useAccount, useWatchContractEvent } from "wagmi";

import { CarRace, ResultModal } from "@/components";
import { RACING_CONTRACT } from "@/data";
import { useReadContract } from "@/hooks";
import { useGameStates } from "@/stores";

const RaceScreen: FC = () => {
  const { address } = useAccount();
  const { raceId, raceInfo, mode } = useGameStates();
  const { getRaceInfo } = useReadContract();

  useWatchContractEvent({
    address: RACING_CONTRACT.address,
    abi: RACING_CONTRACT.ABI,
    eventName: "RaceResultFulfilled",
    onLogs(logs) {
      console.log("RaceResultFulfilled!", logs);
    },
  });

  // Fetch race result after 30 seconds, then every 10 seconds
  useEffect(() => {
    if (!raceId || !mode) return;

    let interval: NodeJS.Timeout;

    const initialTimeout = setTimeout(() => {
      interval = setInterval(async () => {
        const currentRaceInfo = await getRaceInfo(raceId, mode);
        if (currentRaceInfo?.player1Time !== 0 && currentRaceInfo?.player2Time !== 0) {
          clearInterval(interval);
        }
      }, 10000);
    }, 30000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
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
