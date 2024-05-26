import { useMemo, useCallback } from "react";

import { getContract, zeroAddress, type TransactionReceipt } from "viem";
import { usePublicClient, useWalletClient, useWatchContractEvent } from "wagmi";

import { RACING_CONTRACT } from "@/data";
import { useGameStates } from "@/stores";
import { logError } from "@/utils/errorUtil";
import { generateRandomAttributes } from "@/utils/generateCarAttributes";

import { useNotify, useReadContract } from ".";

type JoinSoloRaceArgs = [CarAttributes, CarAttributes, number];
type JoinOtherRaces = [CarAttributes, number];

type MethodArgs = JoinSoloRaceArgs | JoinOtherRaces;

type ContractCallResponse = {
  success: boolean;
  data: TransactionReceipt | null;
  error: string | null;
};

const circuitId = 1;

export const useWriteContract = () => {
  const publicClient = usePublicClient();
  const client = useWalletClient()?.data;
  const { setLoading, setIsWaiting, setTransactionHash } = useGameStates();
  const { notifyError } = useNotify();
  const { mode, betAmount, setRaceId } = useGameStates();
  const { getSoloRaceCount, getFreeRaceCount, getTournamentRaceCount } = useReadContract();

  const racingInstance = useMemo(() => {
    return client ? getContract({ address: RACING_CONTRACT.address, abi: RACING_CONTRACT.ABI, client }) : null;
  }, [client]);

  useWatchContractEvent({
    address: RACING_CONTRACT.address,
    abi: RACING_CONTRACT.ABI,
    eventName: "RandomnessReceived",
    onLogs(logs) {
      console.log("RandomnessReceived!", logs);
    },
  });

  /* Join Race Handler:
   *********************/
  const handleTransaction = useCallback(
    async (
      methodName: string,
      getCount: () => Promise<bigint>,
      setWaiting: boolean,
      value?: bigint,
      ...args: MethodArgs
    ) => {
      if (!racingInstance || !publicClient) {
        return { success: false, data: null, error: "The contract instance is missing." };
      }

      setLoading(true);
      try {
        const raceId = await getCount();
        setRaceId(raceId);

        // Simulate transaction
        await publicClient.simulateContract({
          address: RACING_CONTRACT.address,
          abi: RACING_CONTRACT.ABI,
          functionName: methodName,
          args,
          value: value ?? undefined,
        });

        // Run transaction
        const hash: `0x${string}` = await racingInstance.write[methodName](args, { value: value ?? undefined });

        setTransactionHash(hash);

        const receipt = await publicClient.waitForTransactionReceipt({
          confirmations: 1,
          hash,
          retryCount: 2,
        });

        if (setWaiting) {
          setIsWaiting(true);
        }

        return { success: true, data: receipt, error: null };
      } catch (error: unknown) {
        const msg = logError(error);
        notifyError({
          title: "An error occurred.",
          message: `Something went wrong while joining the race: ${msg}`,
        });
        return { success: false, data: null, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [racingInstance, publicClient, setLoading, setRaceId, setTransactionHash, setIsWaiting, notifyError],
  );

  /* Join Solo Race:
   ******************/
  const joinSoloRace = useCallback(
    async (attributes: CarAttributes): Promise<ContractCallResponse> => {
      return await handleTransaction(
        "joinSoloRace",
        getSoloRaceCount,
        false,
        undefined,
        attributes,
        generateRandomAttributes(),
        circuitId,
      );
    },
    [handleTransaction, getSoloRaceCount],
  );

  /* Join Free Race (1v1):
   **************************/
  const joinFreeRace = useCallback(
    async (attributes: CarAttributes): Promise<ContractCallResponse> => {
      return await handleTransaction("joinFreeRace", getFreeRaceCount, true, undefined, attributes, circuitId);
    },
    [handleTransaction, getFreeRaceCount],
  );

  /* Join Tournament Race (1v1):
   ******************************/
  const joinTournamentRace = useCallback(
    async (attributes: CarAttributes): Promise<ContractCallResponse> => {
      return await handleTransaction("joinRace", getTournamentRaceCount, true, betAmount, attributes, circuitId);
    },
    [handleTransaction, getTournamentRaceCount, betAmount],
  );

  /* Wait for Player:
   *******************/
  const waitForPlayer = useCallback(
    (raceId: bigint, onPlayer2Joined: () => void): void => {
      if (!racingInstance || !publicClient || !mode) return;

      const interval = setInterval(async () => {
        try {
          let raceInfo;

          if (mode === "FREE") {
            raceInfo = (await racingInstance.read.getFreeRaceFromRaceID([raceId])) as RaceInfo;
          } else {
            raceInfo = (await racingInstance.read.getRaceFromRaceID([raceId])) as RaceInfo;
          }

          if (raceInfo.player2 !== zeroAddress) {
            onPlayer2Joined();
            clearInterval(interval);
            setIsWaiting(false);
          }
        } catch (error: unknown) {
          logError(error);
        }
      }, 2000); // Check every 2 seconds
    },
    [racingInstance, publicClient, mode, setIsWaiting],
  );

  return {
    joinSoloRace,
    joinFreeRace,
    joinTournamentRace,
    waitForPlayer,
  };
};
