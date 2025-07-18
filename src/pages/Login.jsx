// src/pages/Login.jsx

import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  useToast,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy]         = useState(false);
  const toast    = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔔 handleSubmit', { email });

    if (!email || !password) {
      toast({
        title: 'Preenche todos os campos.',
        status: 'warning',
        isClosable: true,
      });
      return;
    }

    setBusy(true);
    try {
      console.log('🔐 signInWithEmailAndPassword…');
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ login OK, uid=', cred.user.uid);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('❌ erro no login', err);
      toast({
        title: 'Erro no login',
        description: err.message,
        status: 'error',
        isClosable: true,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="md" shadow="lg" w="full" maxW="md">
        <Heading mb={6} textAlign="center">
          Iniciar Sessão
        </Heading>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </FormControl>

            <Button
              colorScheme="blue"
              type="submit"
              isLoading={busy}
              loadingText="Entrando…"
              w="full"
            >
              Entrar
            </Button>
          </Stack>
        </form>
      </Box>
    </Flex>
  );
}
