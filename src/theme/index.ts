import { createTheme } from '@mui/material/styles';
// ✅ Importa a augmentação de tipos do DataGrid para permitir "MuiDataGrid" no tema
import type {} from '@mui/x-data-grid/themeAugmentation';

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0ea5e9' },     // sky-500
    secondary: { main: '#7c3aed' },   // violet-600
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    brand: { main: '#111827' },       // slate-900
    background: { default: '#f8fafc', paper: '#ffffff' },
  },
  typography: {
    fontFamily:
      `"Inter", system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    h5: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { variant: 'contained', disableElevation: true },
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' } },
    },

    // ✅ Agora o TypeScript reconhece "MuiDataGrid"
    MuiDataGrid: {
      defaultProps: {
        density: 'compact',
        disableRowSelectionOnClick: true,
      },
      styleOverrides: {
        columnHeaders: { backgroundColor: '#fff' },
      },
    },
  },
});

export default theme;
