import { useEffect, type FC } from "react";

import { Button, Center, HStack, VStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAccount } from "wagmi";

import { CarRace, LoserModal, WinnerModal } from "@/components";
import { useReadContract } from "@/hooks";
import { useContract } from "@/stores/useContract";

const RaceScreen: FC = () => {
  const { address } = useAccount();
  const { raceId, raceInfo } = useContract();
  const { getRaceInfo } = useReadContract();

  useEffect(() => {
    if (!raceId) return;

    const interval = setInterval(async () => {
      await getRaceInfo(raceId);
    }, 20000); // 20 seconds interval

    return () => clearInterval(interval); // Clear interval if component unmounts
  }, [raceId, getRaceInfo]);

  const hasRaceFinished = raceInfo && raceInfo.player1Time !== 0;
  const isWinner =
    address &&
    hasRaceFinished &&
    ((address === raceInfo.player1 && raceInfo.player1Time < raceInfo.player2Time) ||
      (address === raceInfo.player2 && raceInfo.player2Time < raceInfo.player1Time));

  return (
    <>
      <Center h={"100%"}>
        <VStack align="center" justify="center">
          <>THE RACE IS ON!</>
          <CarRace />
          <HStack>
            <Link as={NextLink} href="/leaderboard" m={"auto"} style={{ textDecoration: "none" }}>
              <Button className="custom-button">Leaderboard</Button>
            </Link>

            <Link as={NextLink} href="/" m={"auto"} style={{ textDecoration: "none" }}>
              <Button className="custom-button">Home</Button>
            </Link>
          </HStack>
        </VStack>
      </Center>

      {hasRaceFinished &&
        (isWinner ? <WinnerModal raceInfo={raceInfo} /> : <LoserModal raceInfo={raceInfo} />)}
    </>
  );
};

export default RaceScreen;
