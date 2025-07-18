import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Preenche email e password',
        status: 'warning',
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Sessão iniciada!',
        status: 'success',
        isClosable: true,
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast({
        title: 'Erro ao iniciar sessão',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
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
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Entrando…"
              w="full"
            >
              Entrar
            </Button>
          </Stack>
        </form>
        <Text textAlign="center" fontSize="sm" mt={4}>
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
