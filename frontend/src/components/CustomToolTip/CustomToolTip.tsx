import type { FC } from "react";

import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";

type Placement =
  | "auto"
  | "auto-start"
  | "auto-end"
  | "top"
  | "top-start"
  | "top-end"
  | "right"
  | "right-start"
  | "right-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end";

interface CustomToolTipProps {
  children?: React.ReactNode;
  label: string;
  size?: string;
  placement?: Placement;
}

const CustomToolTip: FC<CustomToolTipProps> = ({ children, label, size = "2rem", placement }) => (
  <Tooltip label={label} fontSize={"md"} placement={placement}>
    {children ? children : <QuestionOutlineIcon fontSize={size} />}
  </Tooltip>
);

export default CustomToolTip;
