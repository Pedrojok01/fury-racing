import { useState, type FC } from "react";

import { Button, Icon } from "@chakra-ui/react";
import { AiOutlineFullscreen } from "react-icons/ai";

const FullScreenButton: FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    const elem = document.documentElement;

    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      }
    } else if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Button w={"40px"} h={"40px"} onClick={toggleFullscreen} className="custom-button">
      <Icon as={AiOutlineFullscreen} boxSize={5} />
    </Button>
  );
};

export default FullScreenButton;
