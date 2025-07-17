import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#e3f2ff',
    100: '#b3daff',
    200: '#81c2ff',
    300: '#4faaff',
    400: '#1d92ff',
    500: '#0078e7',
    600: '#005db5',
    700: '#004283',
    800: '#002752',
    900: '#000d21',
  },
};

const theme = extendTheme({ config, colors });

export default theme;
