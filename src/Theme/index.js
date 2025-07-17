import { createSystem, defaultConfig } from '@chakra-ui/react';

const customConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const tokens = {
  colors: {
    brand: {
      50:  { value: '#e3f2ff' },
      100: { value: '#b3daff' },
      200: { value: '#81c2ff' },
      300: { value: '#4faaff' },
      400: { value: '#1d92ff' },
      500: { value: '#0078e7' },
      600: { value: '#005db5' },
      700: { value: '#004283' },
      800: { value: '#002752' },
      900: { value: '#000d21' },
    },
  },
  fonts: {
    heading: { value: "'Inter', sans-serif" },
    body:    { value: "'Inter', sans-serif" },
  },
};

const semanticTokens = {
  colors: {
    brand: {
      solid:    { value: '{colors.brand.500}' },
      subtle:   { value: '{colors.brand.100}' },
      // podes adicionar mais tokens semânticos aqui
    },
  },
};

const theme = createSystem(defaultConfig, {
  theme: {
    tokens,
    semanticTokens,
  },
  config: customConfig,
});

export default theme;
