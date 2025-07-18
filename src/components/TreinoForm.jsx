// src/components/TreinoForm.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  SimpleGrid,
  Heading,
  Flex,
  IconButton,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export default function TreinoForm() {
  const toast = useToast();

  // Lista de clientes
  const [clients, setClients] = useState([]);
  useEffect(() => {
    async function loadClients() {
      const snap = await getDocs(collection(db, 'users'));
      const list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.role === 'cliente');
      setClients(list);
    }
    loadClients();
  }, []);

  // Dados do treino
  const [clienteId, setClienteId] = useState('');
  const [nome, setNome]           = useState('');
  const [objetivos, setObjetivos] = useState('');
  const [duracaoMin, setDuracao]  = useState('');
  const [data, setData]           = useState('');

  // Exercícios
  const [exercicios, setExercicios] = useState([
    {
      nome: '',
      series: '',
      reps: '',
      descansoSegundos: '',
      cargaRecomendadaKg: '',
      instrucoes: ''
    }
  ]);

  const handleAddExercicio = () => {
    setExercicios(prev => [
      ...prev,
      {
        nome: '',
        series: '',
        reps: '',
        descansoSegundos: '',
        cargaRecomendadaKg: '',
        instrucoes: ''
      }
    ]);
  };

  const handleRemoveExercicio = index => {
    setExercicios(prev => prev.filter((_, i) => i !== index));
  };

  const handleChangeExercicio = (index, field, value) => {
    setExercicios(prev => {
      const arr = [...prev];
      arr[index][field] = value;
      return arr;
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!clienteId || !nome || !data || !exercicios.length) {
      toast({ title: 'Preenche os campos obrigatórios', status: 'warning' });
      return;
    }

    try {
      // 1) Cria o treino
      const treinoRef = await addDoc(collection(db, 'treinos'), {
        clienteId,
        trainerId: null, // se tiveres user.uid do trainer, passa aqui
        nome,
        objetivos,
        duracaoMin: Number(duracaoMin),
        data: new Date(data),
        createdAt: serverTimestamp()
      });

      // 2) Cria os exercícios
      const subcol = collection(db, 'treinos', treinoRef.id, 'exercicios');
      await Promise.all(
        exercicios.map(ex =>
          addDoc(subcol, {
            nome: ex.nome,
            series: Number(ex.series),
            reps: Number(ex.reps),
            descansoSegundos: Number(ex.descansoSegundos),
            cargaRecomendadaKg: Number(ex.cargaRecomendadaKg),
            instrucoes: ex.instrucoes
          })
        )
      );

      toast({ title: 'Treino criado com sucesso!', status: 'success' });
      // Limpa o formulário
      setClienteId('');
      setNome('');
      setObjetivos('');
      setDuracao('');
      setData('');
      setExercicios([
        {
          nome: '',
          series: '',
          reps: '',
          descansoSegundos: '',
          cargaRecomendadaKg: '',
          instrucoes: ''
        }
      ]);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao criar treino', status: 'error' });
    }
  };

  return (
    <Box p={6} bg="white" rounded="md" shadow="md">
      <Heading size="md" mb={4}>Novo Treino</Heading>
      <form onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Cliente</FormLabel>
            <Select
              placeholder="Seleciona o cliente"
              value={clienteId}
              onChange={e => setClienteId(e.target.value)}
            />
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.firstName || c.email}
              </option>
            ))}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Data</FormLabel>
            <Input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Nome do Treino</FormLabel>
            <Input
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Objetivos</FormLabel>
            <Textarea
              value={objetivos}
              onChange={e => setObjetivos(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Duração (min)</FormLabel>
            <Input
              type="number"
              value={duracaoMin}
              onChange={e => setDuracao(e.target.value)}
            />
          </FormControl>
        </SimpleGrid>

        <Stack spacing={6} mt={6}>
          <Heading size="sm">Exercícios</Heading>
          {exercicios.map((ex, i) => (
            <Box key={i} p={4} bg="gray.50" rounded="md">
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold">Exercício {i + 1}</Text>
                <IconButton
                  aria-label="Remover exercício"
                  icon={<DeleteIcon />}
                  size="sm"
                  onClick={() => handleRemoveExercicio(i)}
                />
              </Flex>
              <SimpleGrid columns={2} spacing={3} mt={3}>
                <FormControl isRequired>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    value={ex.nome}
                    onChange={e => handleChangeExercicio(i, 'nome', e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Séries</FormLabel>
                    <Input
                      type="number"
                      value={ex.series}
                      onChange={e => handleChangeExercicio(i, 'series', e.target.value)}
                    />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Reps</FormLabel>
                  <Input
                    type="number"
                    value={ex.reps}
                    onChange={e => handleChangeExercicio(i, 'reps', e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Descanso (s)</FormLabel>
                  <Input
                    type="number"
                    value={ex.descansoSegundos}
                    onChange={e => handleChangeExercicio(i, 'descansoSegundos', e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Carga Recomendada (kg)</FormLabel>
                  <Input
                    type="number"
                    value={ex.cargaRecomendadaKg}
                    onChange={e => handleChangeExercicio(i, 'cargaRecomendadaKg', e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Instruções</FormLabel>
                  <Textarea
                    value={ex.instrucoes}
                    onChange={e => handleChangeExercicio(i, 'instrucoes', e.target.value)}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>
          ))}
          <Button leftIcon={<AddIcon />} variant="outline" onClick={handleAddExercicio}>
            Adicionar Exercício
          </Button>
        </Stack>

        <Button mt={6} colorScheme="blue" type="submit">
          Criar Treino
        </Button>
      </form>
    </Box>
  );
}
