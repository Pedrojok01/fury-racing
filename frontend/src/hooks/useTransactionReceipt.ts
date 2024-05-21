// useTransactionReceipt.ts
import { usePublicClient } from "wagmi";

interface AwaitTransactionReceiptProps {
  confirmations?: number;
  hash: `0x${string}`;
}

const useTransactionReceipt = () => {
  const publicClient = usePublicClient();

  const awaitTransactionReceipt = async ({
    confirmations = 1,
    hash,
  }: AwaitTransactionReceiptProps) => {
    if (!publicClient) {
      throw new Error("PublicClientContext is undefined");
    }

    const receipt = await publicClient.waitForTransactionReceipt({
      confirmations,
      hash,
      retryCount: 2,
    });

    return receipt;
  };

  return {
    awaitTransactionReceipt,
  };
};

export default useTransactionReceipt;
