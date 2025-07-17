import { createSystem, defaultConfig } from '@chakra-ui/react';

export const theme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        brand: {
          50: '#e3f2ff',
          /* … */
          900: '#000d21',
        },
      },
      fonts: {
        heading: { value: "'Inter', sans-serif" },
        body:    { value: "'Inter', sans-serif" },
      },
    },
  },
  semanticTokens: {
    colors: {
      brand: {
        solid:     { value: '{colors.brand.500}' },
        contrast:  { value: '{colors.brand.100}' },
        /* … etc */
      },
    },
  },
});
