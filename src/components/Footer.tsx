// src/components/Footer.tsx

import React from 'react';
import { Box, Text, Link, VStack, useColorModeValue } from '@chakra-ui/react';

export const Footer: React.FC = () => {
  const bg = useColorModeValue('white', 'gray.900');

  return (
    <Box as="footer" bg={bg} py={{ base: 4, md: 6 }} boxShadow="inner">
      <VStack spacing={1}>
        <Text fontSize="sm">
          © {new Date().getFullYear()} Fitness Pro.
        </Text>
        <Link fontSize="sm" href="https://github.com/teu-usuario" isExternal>
          GitHub
        </Link>
      </VStack>
    </Box>
  );
};
