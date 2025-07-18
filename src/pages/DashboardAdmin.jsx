import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Spinner } from '@chakra-ui/react';
import { fetchUserProfile } from '../utils/firebaseHelpers';

export default function DashboardAdmin({ user }) {
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
        Bem-vindo, {profile.firstName || profile.email}, Admin!
      </Heading>
      <Text>Este é o painel de administração.</Text>
      {/* … resto do conteúdo específico de admin … */}
    </Box>
  );
}
