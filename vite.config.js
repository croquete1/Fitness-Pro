import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      variables: path.resolve(__dirname, './src/variables'),
      components: path.resolve(__dirname, './src/components'),
    },
  },
});
