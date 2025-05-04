import type { FC } from "react";

import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Tooltip, Portal } from "@chakra-ui/react";

interface CustomToolTipProps {
  children?: React.ReactNode;
  label: string;
  size?: string;
  placement?: any;
}

const returnCorrectSize = (size: string) => {
  if (size === "lg") return <QuestionOutlineIcon size="lg" />;
  if (size === "md") return <QuestionOutlineIcon size="md" />;
  if (size === "sm") return <QuestionOutlineIcon size="sm" />;
  return <QuestionOutlineIcon size="lg" />;
};

const CustomToolTip: FC<CustomToolTipProps> = ({ children, label, size = "lg", placement }) => (
  <Tooltip.Root positioning={{ placement }}>
    <Tooltip.Trigger asChild>{children ?? returnCorrectSize(size)}</Tooltip.Trigger>
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
