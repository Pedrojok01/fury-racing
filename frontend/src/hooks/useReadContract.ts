import { useCallback, useMemo } from "react";

import { getContract } from "viem";
import { usePublicClient } from "wagmi";

import { RACING_CONTRACT } from "@/data";
import { useGameStates } from "@/stores/useGameStates";
import { logError } from "@/utils/errorUtil";

export const useReadContract = () => {
  const { setBetAmount, setPrizePool, setRaceInfo } = useGameStates();
  const client = usePublicClient();

  const racingInstance = useMemo(
    () =>
      client
        ? getContract({ address: RACING_CONTRACT.address, abi: RACING_CONTRACT.ABI, client })
        : null,
    [client],
  );

  /* Get current bet amount :
   ***************************/
  const getBetAmount = useCallback(async (): Promise<void> => {
    if (!racingInstance) return;

    try {
      const betAmount = (await racingInstance.read.betAmount()) as bigint;
      setBetAmount(betAmount);
    } catch (error: unknown) {
      logError(error);
      return;
    }
  }, [racingInstance, setBetAmount]);

  /* Get current bet amount :
   ***************************/
  const getCurrentPrizePool = useCallback(async (): Promise<void> => {
    if (!racingInstance) return;

    try {
      const prizePool = (await racingInstance.read.currentPrizePool()) as bigint;
      setPrizePool(prizePool);
    } catch (error: unknown) {
      logError(error);
      return;
    }
  }, [racingInstance, setPrizePool]);

  /* Get current bet amount :
   ***************************/
  const getRaceInfo = useCallback(
    async (raceId: bigint): Promise<void> => {
      if (!racingInstance) return;

      try {
        const race = (await racingInstance.read.getSoloRaceFromRaceID([raceId])) as RaceInfo;
        if (race.player1Time !== 0 || race.player2Time !== 0) {
          setRaceInfo(race);
        }
      } catch (error: unknown) {
        logError(error);
        return;
      }
    },
    [racingInstance, setRaceInfo],
  );

  return {
    getBetAmount,
    getCurrentPrizePool,
    getRaceInfo,
  };
};
