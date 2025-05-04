import { useEffect, type FC } from "react";

import { Button, Center, Flex, HStack, Link, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { isMobile } from "react-device-detect";
import { formatEther } from "viem";

import { CustomBox, CustomToolTip } from "@/components";
import { useReadContract } from "@/hooks";
import { useGameStates } from "@/stores";
import { t } from "@/utils/i18";

const descriptionText = {
  SOLO: t("mode.description.solo"),
  FREE: t("mode.description.free"),
  TOURNAMENT: t("mode.description.tournament"),
};

const ModeScreen: FC = () => {
  const { getBetAmount, getCurrentPrizePool } = useReadContract();
  const { betAmount, prizePool } = useGameStates();

  useEffect(() => {
    getBetAmount();
    getCurrentPrizePool();
  }, [getBetAmount, getCurrentPrizePool]);

  return (
    <Center h={"inherit"} w="100%" justifyContent="center">
      <VStack h={isMobile ? "100%" : "auto"} gap={isMobile ? 5 : 10}>
        <Text fontSize={isMobile ? "1.2rem" : "3rem"} fontWeight="bold" color="var(--primary-color)">
          {t("mode.subtitles")}
        </Text>

        <HStack gap={5} wrap={"wrap"} justifyContent={"center"}>
          <ButtonMode text="Training" label={descriptionText.SOLO} mode="SOLO" walkthrough="select-mode" />
          <ButtonMode text="Free Play" label={descriptionText.FREE} mode="FREE" />
          <ButtonMode text="Tournament" label={descriptionText.TOURNAMENT} mode="TOURNAMENT" />
        </HStack>

        <CustomBox>
          <Text textAlign="center" className="subtitle" mb={5}>
            {t("mode.info")}
          </Text>
          <Center flexDirection={"column"}>
            <Flex w={"50%"} justifyContent="space-between" minW={280}>
              <Text>{t("mode.fee")}</Text> <Text fontWeight={700}>{formatEther(betAmount) ?? " loading..."} AVAX</Text>
            </Flex>
            <Flex w={"50%"} justifyContent="space-between" minW={280}>
              <Text>{t("mode.prize")}</Text>{" "}
              <Text fontWeight={700}>{formatEther(prizePool) ?? " loading..."} AVAX</Text>
            </Flex>
            <Text mt={"1rem"} fontSize={"0.7em"}>
              {t("mode.note")}
            </Text>
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
  walkthrough?: string;
}

const ButtonMode: FC<ButtonModeProps> = ({ text, label, mode, walkthrough }) => {
  const { setRaceMode } = useGameStates();

  const handleClick = () => {
    setRaceMode(mode);
  };

  return (
    <Link
      as={NextLink}
      href="/selection"
      style={{ textDecoration: "none" }}
      onClick={handleClick}
      className={walkthrough}
    >
      <Button
        w={isMobile ? "200px" : "330px"}
        paddingBlock={isMobile ? "3.5rem" : "6rem"}
        paddingInline={"5rem"}
        fontSize={isMobile ? "1.5rem" : "2.5rem"}
        fontWeight={"bold"}
        className="custom-button"
        css={{ color: "initial" }}
      >
        <VStack gap={5}>
          <Text>{text}</Text>
          <CustomToolTip label={label} size="lg" />
        </VStack>
      </Button>
    </Link>
  );
};
