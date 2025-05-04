import type { FC } from "react";

import { HStack, Stat } from "@chakra-ui/react";
import { isMobile } from "react-device-detect";

interface DisplayStatDataProps {
  label: string;
  data: string;
}

const DisplayStatData: FC<DisplayStatDataProps> = ({ label, data }) => (
  <Stat.Root>
    <HStack>
      <Stat.Label fontSize={isMobile ? "12px" : "17px"}>{label}</Stat.Label>
      <Stat.ValueText fontSize={isMobile ? "medium" : "large"}>{data}</Stat.ValueText>
    </HStack>
  </Stat.Root>
);

export default DisplayStatData;
