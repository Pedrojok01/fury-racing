import { type FC } from "react";

import { Button, Center, HStack, Link, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

import { CustomToolTip } from "@/components/CustomToolTip";
import { useGame } from "@/stores/useGame";

const ModeScreen: FC = () => {
  return (
    <Center h={"100%"} width={"100%"} justifyContent={"center"}>
      <HStack spacing={5} wrap={"wrap"}>
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
