import { Text, Box } from '@chakra-ui/react';
import LayoutCliente from '../components/LayoutCliente';

export default function DashboardCliente({ user }) {
  return (
    <LayoutCliente>
      <Box>
        <Text fontSize="xl" mb={4}>
          Bem-vindo, {user?.email}
        </Text>
        <Text>Este é o teu painel de cliente.</Text>
      </Box>
    </LayoutCliente>
  );
}
