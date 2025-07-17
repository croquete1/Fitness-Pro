import { Text, Box } from '@chakra-ui/react';
import LayoutAdmin from '../components/LayoutAdmin';

export default function DashboardAdmin({ user }) {
  return (
    <LayoutAdmin>
      <Box>
        <Text fontSize="xl" mb={4}>
          Olá Admin, {user?.email}
        </Text>
        <Text>Este é o teu painel de administração.</Text>
      </Box>
    </LayoutAdmin>
  );
}
