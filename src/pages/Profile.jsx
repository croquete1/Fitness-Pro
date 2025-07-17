import { Box, Heading, Text, Stack } from '@chakra-ui/react';
import LayoutAdmin from '../components/LayoutAdmin';
import LayoutTrainer from '../components/LayoutTrainer';
import LayoutCliente from '../components/LayoutCliente';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      getDoc(doc(db, 'users', currentUser.uid)).then(snap => {
        if (snap.exists()) {
          setRole(snap.data().role);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return null;

  const Layout =
    role === 'admin'
      ? LayoutAdmin
      : role === 'trainer'
      ? LayoutTrainer
      : LayoutCliente;

  return (
    <Layout>
      <Box bg="white" p={6} rounded="md" shadow="md" maxW="lg">
        <Heading size="md" mb={4}>
          Perfil do Utilizador
        </Heading>
        <Stack spacing={2}>
          <Text><strong>Nome:</strong> {user?.displayName || '—'}</Text>
          <Text><strong>Email:</strong> {user?.email}</Text>
          <Text><strong>Tipo:</strong> {role}</Text>
        </Stack>
      </Box>
    </Layout>
  );
}
