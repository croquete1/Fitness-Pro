import React, { useState } from 'react';
import {
  Box, Button, Flex, Heading, Input,
  Stack, Text, useToast, FormControl, FormLabel
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Preenche todos os campos.', status: 'warning', isClosable: true });
      return;
    }
    setBusy(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCred.user.uid), { email, role: 'cliente' });
      toast({ title: 'Conta criada!', status: 'success', isClosable: true });
      navigate('/', { replace: true });
    } catch (err) {
      toast({ title: 'Falha no registo', description: err.message, status: 'error', isClosable: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="md" shadow="lg" w="full" maxW="md">
        <Heading mb={6} textAlign="center">Registar Conta</Heading>
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
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </FormControl>
            <Button
              colorScheme="green"
              type="submit"
              isLoading={busy}
              loadingText="Registando…"
              w="full"
            >
              Registar
            </Button>
          </Stack>
        </form>
        <Text textAlign="center" fontSize="sm" mt={4}>
          Já tens conta?{' '}
          <Text as={RouterLink} to="/" color="blue.500">
            Iniciar Sessão
          </Text>
        </Text>
      </Box>
    </Flex>
  );
}
