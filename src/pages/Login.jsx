import {
  Box, Button, Flex, FormControl, FormLabel,
  Heading, Input, Text, useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase'; // ajusta conforme o teu setup

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login bem-sucedido!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      window.location.href = '/dashboard'; // ou usa navigate() se estiveres com React Router v6+
    } catch (error) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="md" shadow="lg" w="full" maxW="md">
        <Heading mb={6} textAlign="center" color="brand.500">
          FitnessPro Login
        </Heading>
        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="exemplo@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl mb={6}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </FormControl>
        <Button colorScheme="brand" w="full" onClick={handleLogin}>
          Entrar
        </Button>
        <Text mt={4} textAlign="center" fontSize="sm" color="gray.600">
          Ainda não tens conta? <a href="/register" style={{ color: '#3182ce' }}>Regista-te</a>
        </Text>
      </Box>
    </Flex>
  );
}
