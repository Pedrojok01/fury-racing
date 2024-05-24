// components/ResultModal.tsx
import { useEffect, useState, type FC } from "react";

import {
  Center,
  Heading,
  Text,
  Button,
  Link,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  HStack,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import Confetti from "react-confetti";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";

import { useReadContract, useWindowSize } from "@/hooks";
import { useGameStates } from "@/stores/useGameStates";
import { getEllipsisTxt } from "@/utils/formatters";

interface ResultModalProps {
  raceInfo: RaceInfo;
  isWinner: boolean;
  mode: RaceMode;
}

const ResultModal: FC<ResultModalProps> = ({ raceInfo, isWinner, mode }) => {
  const { width, height } = useWindowSize();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { reset } = useGameStates();
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

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  const pointsUpdate = (
    <Center textAlign={"center"} marginBlock={5} fontWeight={700}>
      {isTournament ? (
        <VStack>
          {winner === address ? <Text fontSize={"2rem"}>+3 Points !</Text> : <Text fontSize={"2rem"}>+1 Points !</Text>}
          <Text>Current Score: {playerScore ?? ""} ELO</Text>
        </VStack>
      ) : (
        <Text>Play in Tournament Mode to gain points and climb the leaderboard!</Text>
      )}
    </Center>
  );

  return (
    <Box w="100vw" h="100vh">
      {isWinner && (
        <Confetti numberOfPieces={1000} recycle={false} tweenDuration={50000} width={width} height={height} />
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent pt={2} pb={5} bg={isWinner ? "rgba(144, 238, 144, 0.7)" : "rgba(255, 182, 193, 0.7)"}>
          <ModalHeader>
            <Heading as="h2" size="xl" textAlign="center" mb={4}>
              {isWinner ? "🎉 You won! 🎉" : "😢 You Lost!"}
            </Heading>
          </ModalHeader>

          <ModalBody>
            <Text fontSize="lg" textAlign="center" mb={5}>
              {isWinner ? "Congrats! You won the race!" : "Better luck next time!"}
            </Text>
            <VStack justifyContent={"center"}>
              <Text>Winner: {winner === zeroAddress ? "Computer" : getEllipsisTxt(winner, 8)}</Text>
              <Text>Loser: {loser === zeroAddress ? "Computer" : getEllipsisTxt(loser, 8)}</Text>
              {pointsUpdate}
            </VStack>

            <Center>
              <HStack mt={6} mb={0} gap={5}>
                <Link as={NextLink} href="/mode">
                  <Button className="custom-button" w={150} onClick={() => reset()}>
                    Play Again
                  </Button>
                </Link>
                <Link as={NextLink} href="/leaderboard" m={"auto"} style={{ textDecoration: "none" }}>
                  <Button w={150} className="custom-button">
                    Leaderboard
                  </Button>
                </Link>
              </HStack>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ResultModal;
