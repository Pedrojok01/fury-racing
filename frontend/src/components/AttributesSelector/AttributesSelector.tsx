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
} from "@chakra-ui/react";

import { CustomBox } from "../CustomBox";

const defaultAttributes: CarAttributes = {
  reliability: 5,
  speed: 5,
  driver: 5,
  strategy: 5,
  cornering: 5,
  car_balance: 5,
  aerodynamics: 5,
  luck: 5,
};

const totalPoints = 40;

const AttributesSelector: FC = () => {
  const [attributes, setAttributes] = useState<CarAttributes>(defaultAttributes);
  const [remainingPoints, setRemainingPoints] = useState<number>(totalPoints);

  // Update remaining points whenever attributes change
  useEffect(() => {
    const totalUsedPoints = Object.values(attributes).reduce((acc, cur) => acc + cur, 0);
    setRemainingPoints(totalPoints - totalUsedPoints);
  }, [attributes]);

  // Function to handle slider changes
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

        <SimpleGrid columns={2} gap={1} w="full">
          {Object.entries(attributes).map(([key, value]) => (
            <Box key={key}>
              <Text>
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
              </Text>
              <RangeSlider
                defaultValue={[5]}
                min={0}
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
