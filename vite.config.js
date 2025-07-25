// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import purgeCss from 'vite-plugin-purgecss'

export default defineConfig({
  plugins: [
    react(),
    purgeCss({
      content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
      safelist: [
        /^bg-/,
        /^text-/,
        /^me-/,
        /^fs-/,
        /^d-/,
        /^col-/,
        /^row-/,
        /^shadow/,
      ],
    }),
  ],
  // Remove source maps em dev (evita o 404 no index.css.map)
  css: {
    devSourcemap: false,
  },
  build: {
    // Remove source maps em produção
    sourcemap: false,
    // Usa Terser para remover comentários e consoles
    minify: 'terser',
    cssCodeSplit: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('html2canvas')) return 'vendor_html2canvas'
            if (id.includes('coreui')) return 'vendor_coreui'
            if (id.includes('chart.js')) return 'vendor_charts'
            return 'vendor'
          }
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['html2canvas'],
  },
})
