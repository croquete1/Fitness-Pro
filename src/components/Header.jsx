import { Flex, Text, Button } from '@chakra-ui/react';

export default function Header() {
  return (
    <Flex
      as="header"
      bg="white"
      px={6}
      py={4}
      shadow="sm"
      justify="space-between"
      align="center"
      className="sticky top-0 z-10"
    >
      <Text fontSize="lg" fontWeight="bold" color="brand.500">
        Dashboard
      </Text>
      <Button colorScheme="blue" size="sm">
        Terminar Sessão
      </Button>
    </Flex>
  );
}
