/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/horizon-tailwind-react/**/*.{js,jsx,ts,tsx}' // se usares Horizon UI
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
