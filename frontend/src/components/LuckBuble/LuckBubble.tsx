import { memo, type FC } from "react";

import { Text } from "@chakra-ui/react";
import { isMobile } from "react-device-detect";

interface LuckBubbleProps {
  value: string;
  color: string;
}

const LuckBubble: FC<LuckBubbleProps> = ({ value, color }) => {
  return (
    <Text
      fontSize="0.6em"
      fontWeight={600}
      color="white"
      backgroundColor={color}
      borderRadius="50%"
      display="inline-block"
      width={isMobile ? "2.4em" : "2.8em"}
      height={isMobile ? "2.4em" : "2.8em"}
      lineHeight={isMobile ? "2.4em" : "2.8em"}
      textAlign="center"
    >
      {value}
    </Text>
  );
};

export default memo(LuckBubble);
