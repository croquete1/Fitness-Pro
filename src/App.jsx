import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './Theme';

function App() {
  return (
    <ChakraProvider value={theme}>
      {/* … */}
    </ChakraProvider>
  );
}
