"use client";
import { type FC } from "react";

import { Box, Center, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub } from "react-icons/fa6";

import { GITHUB_REPO } from "@/data/constants";
import { images } from "@/data/images";

const Footer: FC = () => {
  return (
    <Flex
      as="footer"
      h={"2.5rem"}
      position="sticky"
      bottom={0}
      zIndex={10}
      justify={"center"}
      align={"center"}
      fontSize={"0.8rem"}
    >
      <Box flex={1} />

      <Center>
        <Text mr={1}>Powered by:</Text>
        <Link href="https://chain.link/" target="_blank" rel="noopener noreferrer">
          <HStack>
            <Image src={images.chainlinkLogo.src} alt="logo" width={25} height={25} />
            <Text fontWeight={800}>Chainlink</Text>
          </HStack>
        </Link>

        <Text mx={1}> and </Text>
        <Link href="https://www.avax.network/" target="_blank" rel="noopener noreferrer">
          <HStack>
            <Image src={images.avaxLogo.src} alt="logo" width={25} height={25} />
            <Text fontWeight={800}>Avalanche</Text>
          </HStack>
        </Link>
      </Center>

      <Box flex={1} display="flex" justifyContent="flex-end">
        <Link href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
          <HStack>
            <Icon as={FaGithub} boxSize={"25px"} />
            <Text textAlign={"right"} pr={5}>
              Source Code
            </Text>
          </HStack>
        </Link>
      </Box>
    </Flex>
  );
};

export default Footer;
