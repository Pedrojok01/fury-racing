import { useState, useCallback, useEffect, type FC } from "react";

import { VStack, Text, Box, SimpleGrid, HStack, StatLabel, StatNumber, Stat } from "@chakra-ui/react";
import Slider from "rc-slider";

import "rc-slider/assets/index.css";
import { CustomBox } from "../CustomBox";
import { CustomToolTip } from "../CustomToolTip";

const attributeLabels: { [key in keyof CarAttributes]: string } = {
  reliability: "Increase the car's reliability and reduce the chance of a breakdown.",
  maniability: "Increase the car's ability to turn and corner at high speeds.",
  speed: "Increase the car's top speed and acceleration.",
  breaks: "Increase the car's braking power and reduce the stopping distance.",
  car_balance: "Increase the car's stability and reduce the chance of spinning out.",
  aerodynamics: "Increase the car's downforce and reduce the chance of losing grip.",
  driver_skills: "Increase the driver's skill and reduce the chance of making mistakes.",
  luck: "Increase your luck and improve the chance of a lucky event.",
};

const totalPoints = 40;

interface CarAttributes {
  reliability: number;
  maniability: number;
  speed: number;
  breaks: number;
  car_balance: number;
  aerodynamics: number;
  driver_skills: number;
  luck: number;
}

interface AttributesSelectorProps {
  defaultAttributes: CarAttributes;
  walktrough?: { attributes: string; luck: string };
}

const AttributesSelector: FC<AttributesSelectorProps> = ({ defaultAttributes, walktrough }) => {
  const [attributes, setAttributes] = useState<CarAttributes>(defaultAttributes);
  const [remainingPoints, setRemainingPoints] = useState<number>(totalPoints);

  useEffect(() => {
    setAttributes(defaultAttributes);
  }, [defaultAttributes]);

  useEffect(() => {
    const totalUsedPoints = Object.values(attributes).reduce((acc, cur) => acc + cur, 0);
    setRemainingPoints(totalPoints - totalUsedPoints);
  }, [attributes]);

  const handleAttributeChange = useCallback((value: number, attribute: keyof CarAttributes) => {
    setAttributes((prev) => {
      const newValue = Math.max(1, Math.min(value, 10)); // Ensure values are within 1-10
      const newAttributes = { ...prev, [attribute]: newValue };
      const totalUsedPoints = Object.values(newAttributes).reduce((acc, cur) => acc + cur, 0);

      if (totalUsedPoints <= totalPoints) {
        return newAttributes;
      }
      return prev;
    });
  }, []);

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
          <Text className="subtitle">2. Adjust Your Settings</Text>
          <Text>Remaining: {remainingPoints}</Text>
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
                    <CustomToolTip label={attributeLabels[key as keyof CarAttributes]} size="1.1rem" />
                    <StatLabel>{key.charAt(0).toUpperCase() + key.slice(1)}:</StatLabel>
                    <StatNumber fontSize="large">{value}</StatNumber>
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
