import { useMemo } from "react";

import { getContract } from "viem";
import { useWalletClient } from "wagmi";

import { RACING_CONTRACT } from "@/data";
import { useAnim } from "@/stores/useAnim";
import { useContract } from "@/stores/useContract";
import { logError } from "@/utils/errorUtil";
import { generateRandomAttributes } from "@/utils/generateCarAttributes";

import { useNotify } from ".";
import useTransactionReceipt from "./useTransactionReceipt";

export const useWriteContract = () => {
  const { notifyError } = useNotify();
  const client = useWalletClient()?.data;
  const { awaitTransactionReceipt } = useTransactionReceipt();
  const { setLoading } = useContract();
  const { carData } = useAnim();

  const rancingInstance = useMemo(
    () =>
      client
        ? getContract({ address: RACING_CONTRACT.address, abi: RACING_CONTRACT.ABI, client })
        : null,
    [client],
  );

  /* Join Solo Race:
   ******************/

  const joinSoloRace = async (): Promise<void> => {
    if (!rancingInstance?.write.joinSoloRace) return;

    setLoading(true);
    try {
      const hash: `0x${string}` = await rancingInstance.write.joinSoloRace([
        carData.attributes,
        generateRandomAttributes(),
        1,
      ]);
      await awaitTransactionReceipt({ hash });
    } catch (error: unknown) {
      notifyError({
        title: "An error occured.",
        message: `Something went wrong while launching the solo race. Please, try again later.`,
      });
      logError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    joinSoloRace,
  };
};
