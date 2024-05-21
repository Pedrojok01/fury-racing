import { useEffect, type FC } from "react";

import { Button, Center, Flex, HStack, Link, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { formatEther } from "viem";

import { CustomBox } from "@/components";
import { CustomToolTip } from "@/components/CustomToolTip";
import { useReadContract } from "@/hooks";
import { useContract } from "@/stores/useContract";
import { useGame } from "@/stores/useGame";

const ModeScreen: FC = () => {
  const { getBetAmount, getCurrentPrizePool } = useReadContract();
  const { betAmount, prizePool } = useContract();

  useEffect(() => {
    getBetAmount();
    getCurrentPrizePool();
  }, [getBetAmount, getCurrentPrizePool]);

  return (
    <Center h={"100%"} width={"100%"} justifyContent={"center"}>
      <VStack spacing={10}>
        <Text fontSize={"3rem"} fontWeight={"bold"} color={"var(--primary-color)"}>
          Select a mode
        </Text>

        <HStack spacing={5} wrap={"wrap"} justifyContent={"center"}>
          <ButtonMode
            text="Training"
            label="Play a quick solo race for free against an AI. No pressure."
            mode="SOLO"
          />
          <ButtonMode
            text="Free Play"
            label="Play a 1v1 race for free against against another player."
            mode="FREE"
          />
          <ButtonMode
            text="Tournament"
            label="Double or nothing: Play and try to double up your bet against another player! Climb up the leaderboard and grab the weekly prize pool!"
            mode="TOURNAMENT"
          />
        </HStack>

        <CustomBox>
          <Text textAlign="center" className="subtitle" mb={5}>
            Tournament Information:
          </Text>
          <Center flexDirection={"column"}>
            <Flex w={"50%"} justifyContent="space-between" minW={280}>
              <Text>Current bet amount:</Text>{" "}
              <Text fontWeight={700}>{formatEther(betAmount)} AVAX</Text>
            </Flex>
            <Flex w={"50%"} justifyContent="space-between" minW={280}>
              <Text>Current prize pool: </Text>{" "}
              <Text fontWeight={700}>{formatEther(prizePool)} AVAX</Text>
            </Flex>
          </Center>
        </CustomBox>
      </VStack>
    </Center>
  );
};

export default ModeScreen;

interface ButtonModeProps {
  text: string;
  label: string;
  mode: RaceMode;
}

const ButtonMode: FC<ButtonModeProps> = ({ text, label, mode }) => {
  const { setScreen, setRaceMode } = useGame();

  const handleClick = () => {
    setScreen("SELECTION");
    setRaceMode(mode);
  };

  return (
    <Link as={NextLink} href="/selection" style={{ textDecoration: "none" }} onClick={handleClick}>
      <Button
        w={"330px"}
        paddingBlock={"6rem"}
        paddingInline={"5rem"}
        fontSize={"2.5rem"}
        fontWeight={"bold"}
        className="custom-button"
      >
        <VStack>
          <Text>{text}</Text>
          <CustomToolTip label={label} size="1.5rem" />
        </VStack>
      </Button>
    </Link>
  );
};
