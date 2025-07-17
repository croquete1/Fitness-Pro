import { Flex, Box } from '@chakra-ui/react';
import SidebarAdmin from './SidebarAdmin';
import Header from './Header';

export default function LayoutAdmin({ children }) {
  return (
    <Flex>
      <SidebarAdmin />
      <Box flex="1" bg="gray.50" minH="100vh">
        <Header />
        <Box px={6} py={4}>{children}</Box>
      </Box>
    </Flex>
  );
}
