import { create } from "zustand";

type ContractState = {
  betAmount: bigint;
  setBetAmount: (betAmount: bigint) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  prizePool: bigint;
  setPrizePool: (prizePool: bigint) => void;
};

const useContract = create<ContractState>((set) => ({
  betAmount: 0n,
  setBetAmount: (betAmount) => set({ betAmount }),
  prizePool: 0n,
  setPrizePool: (prizePool) => set({ prizePool }),
  loading: false,
  setLoading: (loading) => set({ loading }),
}));

export { useContract };
