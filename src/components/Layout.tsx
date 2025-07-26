// src/components/Layout.tsx

import React, { ReactNode } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => (
  <Flex direction="column" minH="100vh">
    <Header />
    <Box
      as="main"
      flex="1"
      px={{ base: 4, md: 8 }}
      py={{ base: 6, md: 10 }}
      maxW="container.xl"
      mx="auto"
    >
      {children}
    </Box>
    <Footer />
  </Flex>
);
