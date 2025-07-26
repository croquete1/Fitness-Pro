// src/components/Header.tsx

import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Link as ChakraLink,
  Button,
  IconButton,
  Image,
  Spacer,
  useColorMode,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useAuth } from '../hooks/useAuth';
import Logo from '../assets/logo.svg';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const navSpacing = useBreakpointValue({ base: 2, md: 4 });

  return (
    <Box
      as="header"
      bg={colorMode === 'light' ? 'white' : 'gray.900'}
      px={{ base: 4, md: 8 }}
      py={3}
      boxShadow="sm"
    >
      <Flex align="center" maxW="container.xl" mx="auto">
        <RouterLink to="/">
          <Flex align="center">
            <Image
              src={Logo}
              alt="Fitness Pro Logo"
              boxSize={{ base: '6', md: '8' }}
              mr={2}
            />
            <Box fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold">
              Fitness Pro
            </Box>
          </Flex>
        </RouterLink>

        <Spacer />

        <HStack spacing={navSpacing}>
          {!user && (
            <>
              <ChakraLink as={RouterLink} to="/login">
                Login
              </ChakraLink>
              <ChakraLink as={RouterLink} to="/signup">
                Registo
              </ChakraLink>
            </>
          )}

          {user && (
            <>
              <ChakraLink as={RouterLink} to="/profile">
                Perfil
              </ChakraLink>
              <Button size="sm" onClick={signOut}>
                Sair
              </Button>
            </>
          )}

          <IconButton
            aria-label="Alternar modo claro/escuro"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            size="sm"
          />
        </HStack>
      </Flex>
    </Box>
  );
};
