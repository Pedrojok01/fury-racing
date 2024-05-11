import { type FC } from "react";

import { Button, Center, HStack, VStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";

import { CarSpin } from "@/components";


const SelectionScreen: FC = () => {
  return (
    <Center h={"100%"}>
      <VStack align="center" justify="center">
        <>CUSTOMISE YOUR CAR</>

        <CarSpin />

        <HStack>
          <Link as={NextLink} href="/" m={"auto"} style={{ textDecoration: "none" }}>
            <Button className="custom-button">Back</Button>
          </Link>

          <Link as={NextLink} href="/race" m={"auto"} style={{ textDecoration: "none" }}>
            <Button className="custom-button">Go</Button>
          </Link>
        </HStack>
      </VStack>
    </Center>
  );
};

export default SelectionScreen;
