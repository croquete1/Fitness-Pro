import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { useToast } from '@chakra-ui/toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: 'Preenche email e password',
        status: 'warning',
        isClosable: true,
      });
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Sessão iniciada!',
        status: 'success',
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Erro ao iniciar sessão',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box
        bg="white"
        p={8}
        rounded="md"
        shadow="lg"
        w="full"
        maxW="md"
      >
        <Heading mb={6} textAlign="center" color="brand.500">
          Iniciar Sessão
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

        <Button
          colorScheme="blue"
          w="full"
          mb={4}
          onClick={handleLogin}
        >
          Entrar
        </Button>

        <Text textAlign="center" fontSize="sm">
          Não tens conta?{' '}
          <Text
            as={RouterLink}
            to="/register"
            color="blue.500"
          >
            Regista-te
          </Text>
        </Text>
      </Box>
    </Flex>
  );
}
