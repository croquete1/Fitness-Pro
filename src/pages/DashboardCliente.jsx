import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function DashboardCliente({ profile }) {
  if (!profile) {
    return (
      <Box textAlign="center" mt="20">
        <Text>Perfil não encontrado.</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={4}>Bem-vindo, {profile.firstName || profile.email}!</Heading>
      <Text>Painel de Cliente.</Text>
    </Box>
  );
}
