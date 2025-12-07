// components/ResultModal.tsx
import { useEffect, useState, type FC } from "react";

import {
  Center,
  Heading,
  Text,
  Button,
  Link,
  Box,
  Dialog,
  Portal,
  useDisclosure,
  HStack,
  VStack,
  Spacer,
} from "@chakra-ui/react";
import NextLink from "next/link";
import Confetti from "react-confetti";
import { isMobile } from "react-device-detect";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { useReadContract, useWindowSize } from "@/hooks";
import { useGameStates } from "@/stores";
import { convertMillisecondsToReadableTime, getEllipsisTxt } from "@/utils/formatters";

interface ResultModalProps {
  isWinner: boolean;
  raceInfo: RaceInfo;
}

const ResultModal: FC<ResultModalProps> = ({ isWinner, raceInfo }) => {
  const { width, height } = useWindowSize();
  const { open, onOpen, onClose } = useDisclosure();
  const { mode, reset } = useGameStates();
  const { address } = useAccount();
  const { getPlayerInfo } = useReadContract();
  const [playerScore, setPlayerScore] = useState<number | null>(null);
  const isTournament = mode === "TOURNAMENT";

  useEffect(() => {
    const getScore = async () => {
      if (isTournament && address) {
        const score = await getPlayerInfo(address);
        if (score === null) return;

        setPlayerScore(score.ELO);
      }
    };

    getScore();
  }, [address, isTournament, getPlayerInfo, setPlayerScore]);

  const winner = raceInfo.player1Time < raceInfo.player2Time ? raceInfo.player1 : raceInfo.player2;
  const loser = raceInfo.player1Time > raceInfo.player2Time ? raceInfo.player1 : raceInfo.player2;
  const winnerTime = convertMillisecondsToReadableTime(
    winner === raceInfo.player1 ? raceInfo.player1Time : raceInfo.player2Time,
  );
  const loserTime = convertMillisecondsToReadableTime(
    winner === raceInfo.player1 ? raceInfo.player2Time : raceInfo.player1Time,
  );

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  const pointsUpdate = (
    <Center textAlign={"center"} marginBlock={isMobile ? 2 : 5} fontWeight={700}>
      {isTournament ? (
        <VStack>
          {winner === address ? <Text fontSize={"2rem"}>+3 Points !</Text> : <Text fontSize={"2rem"}>+1 Point !</Text>}
          <Text>Current Score: {playerScore ?? ""} Points</Text>
        </VStack>
      ) : (
        <Text>Play in Tournament Mode to gain points and climb the leaderboard!</Text>
      )}
    </Center>
  );

  return (
    <Box>
      {isWinner && !isMobile && (
        <Confetti numberOfPieces={1000} recycle={false} tweenDuration={50000} width={width} height={height} />
      )}

      <Dialog.Root
        open={open}
        onOpenChange={(details) => {
          if (!details.open) onClose();
        }}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              pt={isMobile ? 2 : 8}
              pb={isMobile ? 3 : 6}
              bg={isWinner ? "rgba(144, 238, 144, 0.7)" : "rgba(255, 182, 193, 0.7)"}
              w={isMobile ? "95%" : "420px"}
              gap={isMobile ? 4 : 10}
            >
              <Dialog.Header justifyContent="center">
                <Heading as="h2" size={isMobile ? "lg" : "xl"}>
                  {isWinner ? "🎉 You won! 🎉" : "😢 You Lost!"}
                </Heading>
              </Dialog.Header>

              <Dialog.Body>
                <Text fontSize="lg" textAlign={"center"} mb={5}>
                  {isWinner ? "Congrats! You won the race!" : "Better luck next time!"}
                </Text>
                <VStack w={"100%"} wrap={"wrap"} justifyContent={"space-between"}>
                  <Text>Winner: {winner === zeroAddress ? "Computer" : getEllipsisTxt(winner, 8)}</Text>
                  <Text>
                    Time: <b>{winnerTime}</b>
                  </Text>
                  <Spacer />
                  <Text>Loser: {loser === zeroAddress ? "Computer" : getEllipsisTxt(loser, 8)}</Text>
                  <Text>
                    Time: <b>{loserTime}</b>
                  </Text>
                  {pointsUpdate}
                </VStack>

                <Center>
                  <HStack mt={6} mb={0} gap={5}>
                    <Link as={NextLink} href="/mode">
                      <Button className="custom-button" w={150} onClick={() => reset()} css={{ color: "initial" }}>
                        Play Again
                      </Button>
                    </Link>
                    <Link as={NextLink} href="/leaderboard" m={"auto"} style={{ textDecoration: "none" }}>
                      <Button w={150} className="custom-button" css={{ color: "initial" }}>
                        Leaderboard
                      </Button>
                    </Link>
                  </HStack>
                </Center>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
};

export default ResultModal;
