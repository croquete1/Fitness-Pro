import { Flex, Box } from '@chakra-ui/react';
import SidebarTrainer from './SidebarTrainer';
import Header from './Header';

export default function LayoutTrainer({ children }) {
  return (
    <Flex>
      <SidebarTrainer />
      <Box flex="1" bg="gray.50" minH="100vh">
        <Header />
        <Box px={6} py={4}>{children}</Box>
      </Box>
    </Flex>
  );
}
