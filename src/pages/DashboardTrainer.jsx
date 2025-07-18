// src/pages/DashboardTrainer.jsx

import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import TreinoForm from '../components/TreinoForm';

export default function DashboardTrainer({ user, profile }) {
  return (
    <Box p={8}>
      <Heading mb={4}>Dashboard Trainer</Heading>
      <Text mb={6}>
        Bem-vindo, {profile.firstName || profile.email}! Crie aqui os teus treinos.
      </Text>

      <TreinoForm />
    </Box>
  );
}
