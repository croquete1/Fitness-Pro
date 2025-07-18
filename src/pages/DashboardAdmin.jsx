// src/pages/DashboardAdmin.jsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Divider,
  Spinner
} from '@chakra-ui/react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/dashboardAdmin.css';  // Certifica-te de criar este ficheiro

export default function DashboardAdmin({ user, profile }) {
  const [users, setUsers]     = useState([]);
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const snapUsers   = await getDocs(collection(db, 'users'));
    const snapTreinos = await getDocs(collection(db, 'treinos'));
    setUsers(snapUsers.docs.map(d => ({ id: d.id, ...d.data() })));
    setTreinos(snapTreinos.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }

  const changeRole = async (uid, newRole) => {
    await updateDoc(doc(db, 'users', uid), { role: newRole });
    setUsers(u => u.map(x => x.id === uid ? { ...x, role: newRole } : x));
  };

  const removeUser = async (uid) => {
    await deleteDoc(doc(db, 'users', uid));
    setUsers(u => u.filter(x => x.id !== uid));
  };

  const removeTreino = async (treinoId) => {
    await deleteDoc(doc(db, 'treinos', treinoId));
    setTreinos(t => t.filter(x => x.id !== treinoId));
  };

  if (loading) {
    return (
      <Box className="admin-spinner">
        <Spinner size="xl" />
        <Text mt={4}>Carregando dados do sistema…</Text>
      </Box>
    );
  }

  return (
    <Box className="admin-container" p={8}>
      <Heading className="admin-title" mb={6}>🛠 Painel de Administração</Heading>

      <SimpleGrid columns={2} spacing={4} mb={8}>
        <Box className="admin-card">
          <Text className="admin-card-title">Utilizadores</Text>
          <Text>Clientes: {users.filter(u => u.role === 'cliente').length}</Text>
          <Text>Trainers: {users.filter(u => u.role === 'trainer').length}</Text>
          <Text>Admins: {users.filter(u => u.role === 'admin').length}</Text>
        </Box>

        <Box className="admin-card">
          <Text className="admin-card-title">Atividades</Text>
          <Text>Total de treinos: {treinos.length}</Text>
          <Text>
            Último treino:{' '}
            {treinos
              .sort((a, b) => b.data.localeCompare(a.data))[0]?.data || '—'}
          </Text>
        </Box>
      </SimpleGrid>

      <Divider className="admin-divider" mb={6} />

      <Heading size="md" mb={4}>👤 Gestão de Utilizadores</Heading>
      <Table variant="striped" className="admin-table" mb={8}>
        <Thead>
          <Tr>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map(u => (
            <Tr key={u.id}>
              <Td>{u.email}</Td>
              <Td>{u.role}</Td>
              <Td>
                {u.role !== 'admin' && (
                  <>
                    <Button
                      size="sm"
                      mr={2}
                      onClick={() => changeRole(u.id, 'trainer')}
                    >
                      Trainer
                    </Button>
                    <Button
                      size="sm"
                      mr={2}
                      onClick={() => changeRole(u.id, 'cliente')}
                    >
                      Cliente
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => removeUser(u.id)}
                >
                  Remover
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Divider className="admin-divider" my={6} />

      <Heading size="md" mb={4}>📂 Auditoria de Treinos</Heading>
      <Table variant="simple" className="admin-table">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Cliente</Th>
            <Th>Data</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {treinos.map(t => (
            <Tr key={t.id}>
              <Td>{t.nome}</Td>
              <Td>{t.clienteId}</Td>
              <Td>{t.data}</Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => removeTreino(t.id)}
                >
                  Apagar
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
