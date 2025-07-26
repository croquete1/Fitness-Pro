// src/theme/index.ts

import { extendTheme, ThemeConfig, StyleFunctionProps } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      bg: props.colorMode === 'light' ? 'gray.50' : 'gray.800',
      color: props.colorMode === 'light' ? 'gray.800' : 'whiteAlpha.900',
    },
  }),
};

const fonts = {
  heading: 'Inter, sans-serif',
  body: 'Inter, sans-serif',
};

const colors = {
  brand: {
    50: '#e8f0fe',
    100: '#d0e1fd',
    200: '#a3c3fc',
    300: '#75a4fb',
    400: '#4786fa',
    500: '#2d71f8',
    600: '#235aca',
    700: '#1a439c',
    800: '#102d6e',
    900: '#08173f',
  },
};

const components = {
  Link: {
    baseStyle: (props: StyleFunctionProps) => ({
      color: props.colorMode === 'light' ? 'brand.600' : 'brand.200',
      _hover: { textDecoration: 'none', opacity: 0.8 },
    }),
  },
  Button: {
    baseStyle: { borderRadius: 'md' },
    defaultProps: { colorScheme: 'brand' },
  },
};

const breakpoints = {
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
  '2xl': '96em',
};

const theme = extendTheme({
  config,
  styles,
  fonts,
  colors,
  components,
  breakpoints,
});

export default theme;
