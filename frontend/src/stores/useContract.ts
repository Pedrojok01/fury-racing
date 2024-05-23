import type { Log } from "viem";
import { create } from "zustand";

type ContractState = {
  betAmount: bigint;
  setBetAmount: (betAmount: bigint) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  prizePool: bigint;
  setPrizePool: (prizePool: bigint) => void;
  raceId: bigint | null;
  setRaceId: (raceId: bigint) => void;
  raceInfo: RaceInfo | null;
  setRaceInfo: (raceInfo: RaceInfo) => void;
  transactionHash: string | null;
  setTransactionHash: (hash: string) => void;
  eventData: Log | null;
  setEventData: (data: Log) => void;
  reset: () => void;
};

const useContract = create<ContractState>((set) => ({
  betAmount: 0n,
  setBetAmount: (betAmount) => set({ betAmount }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  prizePool: 0n,
  setPrizePool: (prizePool) => set({ prizePool }),
  raceId: null,
  setRaceId: (raceId) => set({ raceId }),
  raceInfo: null,
  setRaceInfo: (raceInfo) => set({ raceInfo }),
  transactionHash: null,
  setTransactionHash: (hash) => set({ transactionHash: hash }),
  eventData: null,
  setEventData: (data) => set({ eventData: data }),
  reset: () =>
    set({
      loading: false,
      raceId: null,
      raceInfo: null,
      transactionHash: null,
      eventData: null,
    }),
}));

export { useContract };
