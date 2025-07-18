import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Spinner } from '@chakra-ui/react';
import { fetchUserProfile } from '../utils/firebaseHelpers';

export default function DashboardTrainer({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchUserProfile(user.uid).then(data => {
      setProfile(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <Box textAlign="center" mt="20">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box textAlign="center" mt="20">
        <Text>Perfil não encontrado.</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={4}>
        Olá, {profile.firstName || profile.email}!  
      </Heading>
      <Text>Bem-vindo ao painel de trainer.</Text>
      {/* … resto do conteúdo específico de trainer … */}
    </Box>
  );
}
