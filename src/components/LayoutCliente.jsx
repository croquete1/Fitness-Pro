import { Flex, Box } from '@chakra-ui/react';
import SidebarCliente from './SidebarCliente';
import Header from './Header';

export default function LayoutCliente({ children }) {
  return (
    <Flex>
      <SidebarCliente />
      <Box flex="1" bg="gray.50" minH="100vh">
        <Header />
        <Box px={6} py={4}>{children}</Box>
      </Box>
    </Flex>
  );
}
