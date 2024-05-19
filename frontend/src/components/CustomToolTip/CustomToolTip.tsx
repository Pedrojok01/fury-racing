import type { FC } from "react";

import { QuestionOutlineIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";

interface CustomToolTipProps {
  children?: React.ReactNode;
  label: string;
  size?: string;
}

const CustomToolTip: FC<CustomToolTipProps> = ({ children, label, size = "2rem" }) => (
  <Tooltip label={label} fontSize={"md"}>
    {children ? children : <QuestionOutlineIcon fontSize={size} />}
  </Tooltip>
);

export default CustomToolTip;
