import { Box, VStack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function SidebarAdmin() {
  return (
    <Box
      w="64"
      bg="brand.500"
      color="white"
      minH="100vh"
      px={4}
      py={6}
      className="hidden md:block"
    >
      <Text fontSize="xl" fontWeight="bold" mb={6}>
        Admin
      </Text>
      <VStack align="start" spacing={4}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/users">Utilizadores</Link>
        <Link to="/settings">Definições</Link>
        <Link to="/profile">Perfil</Link>
      </VStack>
    </Box>
  );
}
