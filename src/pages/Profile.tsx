import { Box, Button, Heading, Text, Spinner } from '@chakra-ui/react';
import { useAuth } from '../hooks/useAuth';

export function Profile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <Box textAlign="center" mt={20}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box maxW="md" mx="auto" mt={20} p={6} boxShadow="lg" borderRadius="md">
      <Heading mb={4}>Perfil</Heading>
      <Text mb={6}>Bem-vindo, {user.email}</Text>
      <Button colorScheme="brand" onClick={signOut}>
        Sair
      </Button>
    </Box>
  );
}
