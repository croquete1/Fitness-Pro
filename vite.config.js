import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',               // <<< Paths relativos
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('chakra-ui') ||
              id.includes('@emotion') ||
              id.includes('framer-motion')
            ) {
              return 'vendor_chakra';
            }
            if (id.includes('firebase')) {
              return 'vendor_firebase';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
