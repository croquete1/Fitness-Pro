export default defineConfig({
  base: './', // importante para Firebase Hosting
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
