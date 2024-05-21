import { useCallback, useMemo } from "react";

import { getContract } from "viem";
import { usePublicClient } from "wagmi";

import { RACING_CONTRACT } from "@/data";
import { useContract } from "@/stores/useContract";
import { logError } from "@/utils/errorUtil";

export const useReadContract = () => {
  const { setBetAmount, setPrizePool } = useContract();
  const client = usePublicClient();

  const rancingInstance = useMemo(
    () =>
      client
        ? getContract({ address: RACING_CONTRACT.address, abi: RACING_CONTRACT.ABI, client })
        : null,
    [client],
  );

  /* Get current bet amount :
   ***************************/
  const getBetAmount = useCallback(async (): Promise<void> => {
    if (!rancingInstance?.read.betAmount) return;

    try {
      const betAmount = (await rancingInstance.read.betAmount()) as bigint;
      setBetAmount(betAmount);
    } catch (error: unknown) {
      logError(error);
      return;
    }
  }, [rancingInstance, setBetAmount]);

  /* Get current bet amount :
   ***************************/
  const getCurrentPrizePool = useCallback(async (): Promise<void> => {
    if (!rancingInstance?.read.betAmount) return;

    try {
      const prizePool = (await rancingInstance.read.currentPrizePool()) as bigint;
      setPrizePool(prizePool);
    } catch (error: unknown) {
      logError(error);
      return;
    }
  }, [rancingInstance, setPrizePool]);

  return {
    getBetAmount,
    getCurrentPrizePool,
  };
};
