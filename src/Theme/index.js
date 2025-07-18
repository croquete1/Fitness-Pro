// src/Theme/index.js

import { extendTheme } from '@chakra-ui/react';

// 1. Configuração de color mode
const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// 2. Gera e exporta o tema com a configuração
const theme = extendTheme({ config });

export default theme;
