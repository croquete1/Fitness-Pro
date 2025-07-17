import { Box, Heading, Button } from '@chakra-ui/react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <Box bg="white" p={6} rounded="md" shadow="md" className="max-w-xl mx-auto">
        <Heading mb={4} color="brand.500">
          Bem-vindo ao FitnessPro
        </Heading>
        <p className="text-gray-700 mb-6">
          Esta página usa Tailwind para layout e Chakra para componentes.
        </p>
        <Button colorScheme="blue">Começar</Button>
      </Box>
    </div>
  );
}
