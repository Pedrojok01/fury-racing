import { useCallback, useMemo } from "react";

import { getContract } from "viem";
import { usePublicClient } from "wagmi";

import { RACING_CONTRACT } from "@/data";
import { useGameStates } from "@/stores";
import { logError } from "@/utils/errorUtil";
import { calculateBaseLuck, raceModeToInt } from "@/utils/formatters";

export const useReadContract = () => {
  const { setBetAmount, setPrizePool, setRaceInfo } = useGameStates();
  const client = usePublicClient();

  const racingInstance = useMemo(
    () => (client ? getContract({ address: RACING_CONTRACT.address, abi: RACING_CONTRACT.ABI, client }) : null),
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

  /* Get current prize pool :
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

  /* Get current solo race count :
   ********************************/
  const getSoloRaceCount = useCallback(async (): Promise<bigint> => {
    if (!racingInstance) return 0n;

    try {
      const soloCount = (await racingInstance.read.soloRaceCounter()) as bigint;
      return soloCount;
    } catch (error: unknown) {
      logError(error);
      return 0n;
    }
  }, [racingInstance]);

  /* Get current free race count :
   *********************************/
  const getFreeRaceCount = useCallback(async (): Promise<bigint> => {
    if (!racingInstance) return 0n;

    try {
      const freeCount = (await racingInstance.read.freeRaceCounter()) as bigint;
      return freeCount;
    } catch (error: unknown) {
      logError(error);
      return 0n;
    }
  }, [racingInstance]);

  /* Get current tournament race count :
   ******************************************/
  const getTournamentRaceCount = useCallback(async (): Promise<bigint> => {
    if (!racingInstance) return 0n;

    try {
      const betCount = (await racingInstance.read.raceCounter()) as bigint;
      return betCount;
    } catch (error: unknown) {
      logError(error);
      return 0n;
    }
  }, [racingInstance]);

  /* Get player info for address :
   *******************************/
  const getPlayerInfo = useCallback(
    async (address: `0x${string}`): Promise<PlayerInfo | null> => {
      if (!racingInstance) return null;

      try {
        const info = (await racingInstance.read.addressToPlayer([address])) as [CarAttributes, `0x${string}`, number];
        const playerInfo = {
          attributes: info[0],
          playerAddress: info[1],
          ELO: info[2],
        };
        return playerInfo;
      } catch (error: unknown) {
        logError(error);
        return null;
      }
    },
    [racingInstance],
  );

  /* Get chainlink random words :
   *****************************/
  const getRandomWords = useCallback(
    async (raceId: bigint, mode: RaceMode): Promise<number[]> => {
      if (!racingInstance) return [];

      try {
        const words = (await racingInstance.read.getRandomWords([raceId, raceModeToInt[mode]])) as [bigint, bigint];
        return words.map((word) => calculateBaseLuck(word));
      } catch (error: unknown) {
        logError(error);
        return [];
      }
    },
    [racingInstance],
  );

  /* Get race info for raceId :
   *****************************/
  const getRaceInfo = useCallback(
    async (raceId: bigint, mode: RaceMode): Promise<RaceInfo | undefined> => {
      if (!racingInstance) return undefined;

      try {
        let race: RaceInfo | null = null;

        switch (mode) {
          case "SOLO":
            race = (await racingInstance.read.getSoloRaceFromRaceID([raceId])) as RaceInfo;
            break;
          case "FREE":
            race = (await racingInstance.read.getFreeRaceFromRaceID([raceId])) as RaceInfo;
            break;
          case "TOURNAMENT":
            race = (await racingInstance.read.getRaceFromRaceID([raceId])) as RaceInfo;
            break;
          default:
            throw new Error(`Unsupported race mode: ${mode}`);
        }

        if (race && (race.player1Time !== 0 || race.player2Time !== 0)) {
          setRaceInfo(race);
          return race;
        }
      } catch (error: unknown) {
        logError(error);
        return undefined;
      }
    },
    [racingInstance, setRaceInfo],
  );

  return {
    getBetAmount,
    getCurrentPrizePool,
    getSoloRaceCount,
    getFreeRaceCount,
    getTournamentRaceCount,
    getPlayerInfo,
    getRandomWords,
    getRaceInfo,
  };
};
