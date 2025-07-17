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
import { Radio, RadioGroup } from '@chakra-ui/radio';
import { useToast } from '@chakra-ui/toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cliente');
  const toast = useToast();
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast({
        title: 'Preenche todos os campos',
        status: 'warning',
        isClosable: true,
      });
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        createdAt: new Date(),
      });

      toast({
        title: 'Registo efetuado!',
        status: 'success',
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Erro no registo',
        description: error.message,
        status: 'error',
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="md" shadow="lg" w="full" maxW="md">
        <Heading mb={6} textAlign="center" color="brand.500">
          Registo FitnessPro
        </Heading>
        <FormControl mb={4}>
          <FormLabel>Nome</FormLabel>
          <Input
            placeholder="João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="exemplo@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        <FormControl mb={6}>
          <FormLabel>Tipo de Utilizador</FormLabel>
          <RadioGroup onChange={setRole} value={role}>
            <Stack direction="row">
              <Radio value="cliente">Cliente</Radio>
              <Radio value="trainer">Personal Trainer</Radio>
              <Radio value="admin">Admin</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        <Button colorScheme="blue" w="full" onClick={handleRegister}>
          Registar
        </Button>
        <Text mt={4} textAlign="center" fontSize="sm">
          Já tens conta?{' '}
          <Text as="a" href="/" color="blue.500">
            Faz login
          </Text>
        </Text>
      </Box>
    </Flex>
  );
}
