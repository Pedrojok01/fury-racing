import { type FC } from "react";

import { VStack, Box, HStack, StatLabel, StatNumber, Stat, Badge } from "@chakra-ui/react";
import Image from "next/image";
import { isMobile } from "react-device-detect";
import { useAccount } from "wagmi";

import { CustomBox, LuckBubble } from "@/components";
import { images } from "@/data";
import { useWindowSize } from "@/hooks";
import { useGameStates } from "@/stores";
import { formatLuck, getLuckPercentage } from "@/utils/formatters";

const calculateAdjustedValue = (value: number, adjustment: number): number => {
  const adjustmentFactor = 1 + adjustment / 100;
  return Number((value * adjustmentFactor).toFixed(2));
};

const AttributesRace: FC = () => {
  const { address } = useAccount();
  const { raceInfo, luck, attributes } = useGameStates();
  const { width } = useWindowSize();

  const extraLuck = address?.toLowerCase() === raceInfo?.player1?.toLowerCase() ? luck.player1 : luck.player2;
  const luckPercentage = getLuckPercentage(attributes.luck);
  const totalAdjustment = Number(luckPercentage) + extraLuck;

  const shouldDisplay = width > 1050 || isMobile;

  return (
    <CustomBox>
      <VStack gap={isMobile ? 1.5 : 5} w="100%" minW="200px">
        <HStack w="100%" position="relative" mb={5}>
          {shouldDisplay && (
            <HStack textAlign="left">
              <Badge colorScheme="teal" fontSize={isMobile ? "0.7em" : "1em"} px={4} py={2} borderRadius="md">
                RNG Luck: {formatLuck(extraLuck)}
              </Badge>
            </HStack>
          )}
          <HStack
            position="absolute"
            top={isMobile ? "-27px" : "-54px"}
            right={isMobile ? "-32px" : "-50px"}
            zIndex={20}
          >
            <Image src={images.live.src} alt="logo" width={isMobile ? 100 : 150} height={isMobile ? 65 : 97} />
          </HStack>
        </HStack>

        {Object.entries(attributes).map(([key, value]) => {
          const adjustedValue = calculateAdjustedValue(value, totalAdjustment);

          return key !== "luck" ? (
            <Box key={key} w="100%">
              <Stat w="100%">
                <HStack w="100%">
                  <HStack textAlign="left" w="100%">
                    <StatLabel fontSize={isMobile ? "12px" : "16px"}>
                      {key === "breaks" ? "Brakes" : key.charAt(0).toUpperCase() + key.slice(1)}:
                    </StatLabel>
                    <StatNumber fontSize={isMobile ? "medium" : "large"}>
                      {key !== "luck" ? adjustedValue : value}
                    </StatNumber>
                  </HStack>

                  <HStack textAlign="right">
                    {shouldDisplay && (
                      <>
                        <LuckBubble value={`${luckPercentage}%`} color="var(--secondary-color)" />
                        <LuckBubble value={formatLuck(extraLuck)} color="var(--primary-color)" />
                      </>
                    )}
                  </HStack>
                </HStack>
              </Stat>
            </Box>
          ) : (
            <Box key={key} />
          );
        })}
      </VStack>
    </CustomBox>
  );
};

export default AttributesRace;
