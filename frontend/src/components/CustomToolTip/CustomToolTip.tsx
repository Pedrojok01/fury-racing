import type { FC } from "react";

import { Tooltip, Portal, Icon } from "@chakra-ui/react";
import { AiOutlineQuestionCircle } from "react-icons/ai";

interface CustomToolTipProps {
  children?: React.ReactNode;
  label: string;
  size?: string;
  placement?: any;
}

const CustomToolTip: FC<CustomToolTipProps> = ({ children, label, size = "1rem", placement }) => (
  <Tooltip.Root positioning={{ placement }}>
    <Tooltip.Trigger asChild>{children ?? <Icon as={AiOutlineQuestionCircle} boxSize={size} />}</Tooltip.Trigger>
    <Portal>
      <Tooltip.Positioner>
        <Tooltip.Content fontSize={"md"} lineHeight={"1.5"} padding={3}>
          {label}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Portal>
  </Tooltip.Root>
);

export default CustomToolTip;
