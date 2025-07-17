import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  RadioGroup,
  Radio,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // ajusta para '../services/firebase' se necessário

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
        title: 'Preenche todos os campos.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        createdAt: new Date(),
      });

      toast({
        title: 'Registo concluído!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Erro ao registar',
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
          Registo FitnessPro
        </Heading>
        <FormControl mb={4}>
          <FormLabel>Nome</FormLabel>
          <Input
            type="text"
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
        <Text mt={4} textAlign="center" fontSize="sm" color="gray.600">
          Já tens conta?{' '}
          <a href="/" style={{ color: '#3182ce' }}>
            Faz login
          </a>
        </Text>
      </Box>
    </Flex>
  );
}
