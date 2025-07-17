import { Text, Box } from '@chakra-ui/react';
import LayoutTrainer from '../components/LayoutTrainer';

export default function DashboardTrainer({ user }) {
  return (
    <LayoutTrainer>
      <Box>
        <Text fontSize="xl" mb={4}>
          Olá PT, {user?.email}
        </Text>
        <Text>Este é o teu painel de personal trainer.</Text>
      </Box>
    </LayoutTrainer>
  );
}
