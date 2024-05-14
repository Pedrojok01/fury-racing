import { type FC } from "react";

import { Text, VStack } from "@chakra-ui/react";

import { CustomBox } from "../CustomBox";

const Weather: FC = () => {
  return (
    <CustomBox>
      <VStack alignItems={"flex-start"}>
        <Text textAlign={"left"} className="subtitle">
          Waether Information
        </Text>
      </VStack>
    </CustomBox>
  );
};

export default Weather;
