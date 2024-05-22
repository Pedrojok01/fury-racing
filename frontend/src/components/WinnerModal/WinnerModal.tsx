// components/WinnerModal.tsx
import { useEffect, type FC } from "react";

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
} from "@chakra-ui/react";
import NextLink from "next/link";
import Confetti from "react-confetti";
import { zeroAddress } from "viem";

import { useWindowSize } from "@/hooks";
import { getEllipsisTxt } from "@/utils/formatters";

interface WinnerModalProps {
  raceInfo: RaceInfo;
}

const WinnerModal: FC<WinnerModalProps> = ({ raceInfo }) => {
  const { width, height } = useWindowSize();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const winner = raceInfo.player1Time < raceInfo.player2Time ? raceInfo.player1 : raceInfo.player2;
  const loser = raceInfo.player1Time > raceInfo.player2Time ? raceInfo.player1 : raceInfo.player2;

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <Box w="100vw" h="100vh">
      <Confetti
        numberOfPieces={1000}
        recycle={false}
        tweenDuration={50000}
        width={width}
        height={height}
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent pt={2} pb={5} bg="rgba(144, 238, 144, 0.7)">
          <ModalHeader>
            <Heading as="h2" size="xl" textAlign="center" mb={4}>
              🎉 You won! 🎉
            </Heading>
          </ModalHeader>
          <ModalBody>
            <Text fontSize="lg" textAlign="center" mb={5}>
              You won the race!
              <br />
              Winner: {winner === zeroAddress ? "Computer" : getEllipsisTxt(winner, 8)}
              <br />
              Loser: {loser === zeroAddress ? "Computer" : getEllipsisTxt(loser, 8)}
            </Text>
            <Center>
              <Link as={NextLink} href="/mode">
                <Button className="custom-button" mt={6} mb={0}>
                  Play Again
                </Button>
              </Link>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default WinnerModal;
