// components/LoserModal.tsx
import { useEffect, type FC } from "react";

import {
  Center,
  Heading,
  Text,
  Button,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { zeroAddress } from "viem";

import { getEllipsisTxt } from "@/utils/formatters";

interface LoserModalProps {
  raceInfo: RaceInfo;
}

const LoserModal: FC<LoserModalProps> = ({ raceInfo }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const winner = raceInfo.player1Time < raceInfo.player2Time ? raceInfo.player1 : raceInfo.player2;
  const loser = raceInfo.player1Time > raceInfo.player2Time ? raceInfo.player1 : raceInfo.player2;

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent pt={2} pb={5} bg="rgba(255, 182, 193, 0.7)">
        <ModalHeader>
          <Heading as="h2" size="xl" textAlign="center" mb={4}>
            😢 You Lost!
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="lg" textAlign="center" mb={5}>
            Better luck next time!
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
  );
};

export default LoserModal;
