import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Link,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await signUp(email, password);
    if (error) {
      toast({
        title: 'Erro ao registar',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      navigate('/profile');
    }
  }

  return (
    <Box maxW="md" mx="auto" mt={20} p={6} boxShadow="lg" borderRadius="md">
      <Heading mb={6} textAlign="center">Registo</Heading>
      <VStack as="form" spacing={4} onSubmit={handleSubmit}>
        <FormControl id="email" isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </FormControl>

        <Button type="submit" colorScheme="brand" w="full">
          Registar
        </Button>

        <Text>
          Já tens conta?{' '}
          <Link as={RouterLink} to="/login" color="brand.500">
            Fazer login
          </Link>
        </Text>
      </VStack>
    </Box>
  );
}
