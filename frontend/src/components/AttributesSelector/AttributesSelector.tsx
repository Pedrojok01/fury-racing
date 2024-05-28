import { useCallback, useEffect, type FC } from "react";

import { VStack, Text, Box, SimpleGrid, HStack, StatLabel, StatNumber, Stat } from "@chakra-ui/react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { isMobile } from "react-device-detect";

import { useDebounce } from "@/hooks";
import { useGameStates } from "@/stores";
import { getLuckPercentage } from "@/utils/formatters";
import { t } from "@/utils/i18";

import { CustomBox } from "../CustomBox";
import { CustomToolTip } from "../CustomToolTip";

const attributeLabels: { [key in keyof CarAttributes]: string } = {
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

const totalPoints = 40;

const AttributesSelector: FC<AttributesSelectorProps> = ({ defaultAttributes, walktrough }) => {
  const { attributes, remainingPoints, setAttributes, setRemainingPoints } = useGameStates();

  const debouncedAttributes = useDebounce(attributes, 1000);

  useEffect(() => {
    setAttributes(defaultAttributes);
  }, [defaultAttributes, setAttributes]);

  useEffect(() => {
    const totalUsedPoints = Object.values(debouncedAttributes).reduce((acc, cur) => acc + cur, 0);
    setRemainingPoints(totalPoints - totalUsedPoints);
  }, [debouncedAttributes, setRemainingPoints]);

  const handleAttributeChange = useCallback(
    (value: number, attribute: keyof CarAttributes) => {
      setAttributes((prev) => {
        const newValue = Math.max(1, Math.min(value, 10)); // Ensure values are within 1-10
        const newAttributes = { ...prev, [attribute]: newValue };
        const totalUsedPoints = Object.values(newAttributes).reduce((acc, cur) => acc + cur, 0);

        if (totalUsedPoints <= totalPoints) {
          return newAttributes;
        }
        return prev;
      });
    },
    [setAttributes],
  );

  const handleSliderChange = useCallback((value: number, min: number, max: number) => {
    return Math.max(min, Math.min(value, max));
  }, []);

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
      <VStack spacing={5} w={"100%"}>
        <HStack w={"100%"} justify={"space-between"} className={walktrough?.attributes}>
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
                <Stat>
                  <HStack>
                    {!isMobile && <CustomToolTip label={attributeLabels[key as keyof CarAttributes]} size="1.1rem" />}
                    <StatLabel fontSize={isMobile ? "12px" : "17px"}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </StatLabel>
                    <StatNumber fontSize={isMobile ? "medium" : "large"}>{value}</StatNumber>
                    {key !== "luck" && (
                      <StatNumber
                        fontSize="0.6em"
                        fontWeight={600}
                        color={"white"}
                        backgroundColor="rgba(114, 207, 66)"
                        borderRadius="50%"
                        display="inline-block"
                        width={isMobile ? "2.4em" : "2.8em"}
                        height={isMobile ? "2.4em" : "2.8em"}
                        lineHeight={isMobile ? "2.4em" : "2.8em"}
                        textAlign="center"
                      >
                        {`${getLuckPercentage(attributes.luck)}%`}
                      </StatNumber>
                    )}
                  </HStack>
                </Stat>
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
