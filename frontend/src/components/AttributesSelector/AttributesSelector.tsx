import { type FC } from "react";

import { VStack, Text, Box, SimpleGrid, HStack, Stat } from "@chakra-ui/react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { isMobile } from "react-device-detect";

import { useAttributes } from "@/hooks";
import { useGameStates } from "@/stores";
import { getLuckPercentage } from "@/utils/formatters";
import { t } from "@/utils/i18";

import { CustomBox } from "../CustomBox";
import { CustomToolTip } from "../CustomToolTip";
import { LuckBubble } from "../LuckBuble";

const attributeLabels: Record<keyof CarAttributes, string> = {
  reliability: t("selection.attributesDescription.reliability"),
  maniability: t("selection.attributesDescription.maniability"),
  speed: t("selection.attributesDescription.speed"),
  breaks: t("selection.attributesDescription.breaks"),
  car_balance: t("selection.attributesDescription.car_balance"),
  aerodynamics: t("selection.attributesDescription.aerodynamics"),
  driver_skills: t("selection.attributesDescription.driver_skills"),
  luck: t("selection.attributesDescription.luck"),
};

interface AttributesSelectorProps {
  defaultAttributes: CarAttributes;
  walktrough?: { attributes: string; luck: string };
}

const AttributesSelector: FC<AttributesSelectorProps> = ({ defaultAttributes, walktrough }) => {
  const { attributes, remainingPoints } = useGameStates();
  const { handleAttributeChange, handleSliderChange } = useAttributes(defaultAttributes);

  const renderSlider = (key: keyof CarAttributes, value: number, min: number, max: number) => (
    <Box position="relative" py={2}>
      <Slider
        min={1}
        max={10}
        value={value}
        onChange={(val) => handleAttributeChange(handleSliderChange(val as number, min, max), key)}
        styles={{
          track: { backgroundColor: "lightgray" },
          handle: { borderColor: "var(--primary-color)", width: "17px", height: "17px", top: "3px", zIndex: 20 },
          rail: { backgroundColor: "lightgray" },
        }}
      />
      <Box
        position="absolute"
        left={`${((min - 1) / 9) * 100}%`}
        right={`${((10 - max) / 9) * 100}%`}
        top="50%"
        height="4px"
        backgroundColor="rgba(0, 128, 0, 0.8)"
        zIndex={10}
        transform="translateY(-50%)"
      />
    </Box>
  );

  return (
    <CustomBox>
      <VStack gap={5} w="100%">
        <HStack w="100%" justify={"space-between"} className={walktrough?.attributes}>
          <Text className="subtitle">{t("selection.subtitles.attributes")}</Text>
          <Text fontSize={isMobile ? "14px" : "17px"}>Remaining: {remainingPoints}</Text>
        </HStack>

        <SimpleGrid columns={2} gridColumnGap={5} gridRowGap={1} w="full">
          {Object.entries(attributes).map(([key, value]) => {
            const attributeKey = key as keyof CarAttributes;
            const maxRange = attributeKey === "luck" ? 10 : Math.min(10, defaultAttributes[attributeKey] + 2);
            const minRange = attributeKey === "luck" ? 1 : Math.max(1, defaultAttributes[attributeKey] - 2);

            return (
              <Box key={key} className={attributeKey === "luck" ? walktrough?.luck : ""}>
                <Stat.Root>
                  <HStack>
                    {!isMobile && <CustomToolTip label={attributeLabels[key as keyof CarAttributes]} />}
                    <Stat.Label fontSize={isMobile ? "12px" : "17px"}>
                      {key === "breaks" ? "Brakes" : key.charAt(0).toUpperCase() + key.slice(1)}:
                    </Stat.Label>
                    <Stat.ValueText fontSize={isMobile ? "medium" : "large"}>{value}</Stat.ValueText>
                    {key !== "luck" && (
                      <LuckBubble value={`${getLuckPercentage(attributes.luck)}%`} color="var(--secondary-color)" />
                    )}
                  </HStack>
                </Stat.Root>
                {renderSlider(attributeKey, value, minRange, maxRange)}
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>
    </CustomBox>
  );
};

export default AttributesSelector;
