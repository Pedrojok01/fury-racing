import { useState, useCallback, useEffect, type FC } from "react";

import {
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  VStack,
  Text,
  Box,
  SimpleGrid,
  HStack,
  StatLabel,
  StatNumber,
  Stat,
} from "@chakra-ui/react";

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

  // Update remaining points whenever attributes change
  useEffect(() => {
    const totalUsedPoints = Object.values(attributes).reduce((acc, cur) => acc + cur, 0);
    setRemainingPoints(totalPoints - totalUsedPoints);
  }, [attributes]);

  const handleAttributeChange = useCallback((value: number, attribute: keyof CarAttributes) => {
    setAttributes((prev) => {
      const newValue = Math.max(0, Math.min(value, 10)); // Ensure values are within 0-10
      const newAttributes = { ...prev, [attribute]: newValue };

      // Calculate the new total points used after the change
      const totalUsedPoints = Object.values(newAttributes).reduce((acc, cur) => acc + cur, 0);

      // Only accept the new value if it doesn't exceed the total points available
      if (totalUsedPoints <= totalPoints) {
        return newAttributes;
      }
      return prev; // Otherwise, reject the change
    });
  }, []);

  return (
    <CustomBox>
      <VStack spacing={5} w={"100%"}>
        <HStack w={"100%"} justify={"space-between"}>
          <Text className="subtitle">2. Adjust Your Settings</Text>
          <Text>Remaining: {remainingPoints}</Text>
        </HStack>

        <SimpleGrid columns={2} gap={1} w="full" className={walktrough?.attributes}>
          {Object.entries(attributes).map(([key, value]) => (
            <Box key={key} className={attributeLabels[key as keyof CarAttributes] === "luck" ? walktrough?.luck : ""}>
              <Stat>
                <HStack>
                  <CustomToolTip label={attributeLabels[key as keyof CarAttributes]} size="1.1rem" />
                  <StatLabel>{key.charAt(0).toUpperCase() + key.slice(1)}:</StatLabel>
                  <StatNumber fontSize="large">{value}</StatNumber>
                </HStack>
              </Stat>
              <RangeSlider
                value={[value]}
                min={1}
                max={10}
                onChangeEnd={(val) => handleAttributeChange(val[0], key as keyof CarAttributes)}
              >
                <RangeSliderTrack>
                  <RangeSliderFilledTrack />
                </RangeSliderTrack>
                <RangeSliderThumb index={0} />
              </RangeSlider>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </CustomBox>
  );
};

export default AttributesSelector;
