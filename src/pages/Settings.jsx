import {
  Box,
  Heading,
  Text,
  Stack,
  Switch,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useColorMode } from '@chakra-ui/react';
import LayoutAdmin from '../components/LayoutAdmin';
import LayoutTrainer from '../components/LayoutTrainer';
import LayoutCliente from '../components/LayoutCliente';
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Settings() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
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
          Definições
        </Heading>
        <Stack spacing={4}>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="dark-mode" mb="0">
              Tema escuro
            </FormLabel>
            <Switch
              id="dark-mode"
              isChecked={colorMode === 'dark'}
              onChange={toggleColorMode}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Idioma</FormLabel>
            <Select defaultValue="pt">
              <option value="pt">Português</option>
              <option value="en">Inglês</option>
              <option value="es">Espanhol</option>
            </Select>
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="notifications" mb="0">
              Notificações
            </FormLabel>
            <Switch id="notifications" defaultChecked />
          </FormControl>
        </Stack>
      </Box>
    </Layout>
  );
}
