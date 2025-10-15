import { alpha, createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    brand: Palette['primary'];
  }
  interface PaletteOptions {
    brand?: PaletteOptions['primary'];
  }
}

const FONT_STACK = 'Inter, "Inter var", "Space Grotesk", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export function createNeoTheme(mode: PaletteMode = 'light') {
  const isDark = mode === 'dark';

  const palette = {
    mode,
    primary: {
      main: isDark ? '#4be7ff' : '#00d4ff',
      light: isDark ? '#7bf0ff' : '#4be7ff',
      dark: isDark ? '#00b2d6' : '#0093c7',
      contrastText: '#05070f',
    },
    secondary: {
      main: isDark ? '#b174ff' : '#7f5bff',
      light: isDark ? '#caa6ff' : '#a68aff',
      dark: isDark ? '#8b4dff' : '#5c3bff',
      contrastText: '#05070f',
    },
    brand: {
      main: isDark ? '#6f7cff' : '#4450ff',
      light: isDark ? '#9ea8ff' : '#8a92ff',
      dark: isDark ? '#4959d6' : '#2b30c7',
      contrastText: '#05070f',
    },
    background: {
      default: isDark ? '#05070f' : '#edf3ff',
      paper: isDark ? 'rgba(10, 18, 32, 0.88)' : 'rgba(252, 253, 255, 0.9)',
    },
    divider: isDark ? 'rgba(148, 163, 184, 0.24)' : 'rgba(87, 122, 255, 0.18)',
    text: {
      primary: isDark ? '#e6ebff' : '#0b1020',
      secondary: isDark ? '#9aaad6' : '#4a5875',
    },
    success: { main: isDark ? '#34d399' : '#039d6d' },
    warning: { main: isDark ? '#facc15' : '#f59f0b' },
    error: { main: isDark ? '#fb7185' : '#ef4444' },
    info: { main: isDark ? '#38bdf8' : '#0ea5e9' },
  } as const;

  let theme = createTheme({
    palette,
    shape: { borderRadius: 18 },
    typography: {
      fontFamily: FONT_STACK,
      fontWeightBold: 700,
      fontWeightMedium: 600,
      h1: { fontWeight: 700, letterSpacing: '-0.045em' },
      h2: { fontWeight: 700, letterSpacing: '-0.035em' },
      h3: { fontWeight: 600, letterSpacing: '-0.025em' },
      h4: { fontWeight: 600, letterSpacing: '-0.02em' },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.04em' },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
    },
  });

  const borderColor = isDark
    ? alpha(theme.palette.primary.light, 0.28)
    : alpha(theme.palette.primary.main, 0.18);
  const translucentBorder = isDark
    ? '1px solid rgba(90, 128, 255, 0.32)'
    : '1px solid rgba(109, 132, 255, 0.18)';
  const surfaceGradient = isDark
    ? 'linear-gradient(160deg, rgba(14, 22, 37, 0.94) 0%, rgba(9, 17, 29, 0.92) 55%, rgba(5, 10, 22, 0.96) 100%)'
    : 'linear-gradient(160deg, rgba(255, 255, 255, 0.95) 0%, rgba(233, 242, 255, 0.94) 58%, rgba(255, 255, 255, 0.98) 100%)';
  const glowShadow = isDark
    ? '0 34px 80px rgba(3, 10, 28, 0.72), 0 18px 40px rgba(9, 17, 35, 0.58)'
    : '0 34px 90px rgba(15, 35, 92, 0.22), 0 14px 36px rgba(68, 94, 255, 0.18)';
  const hoverGlow = isDark
    ? '0 18px 40px rgba(5, 19, 49, 0.55)'
    : '0 22px 44px rgba(73, 115, 255, 0.2)';

  theme = createTheme(theme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
          },
          body: {
            backgroundColor: theme.palette.background.default,
            backgroundImage: isDark
              ? `radial-gradient(1200px 800px at -15% -20%, rgba(59, 130, 246, 0.16), transparent 60%),
                 radial-gradient(1000px 760px at 120% -20%, rgba(217, 70, 239, 0.12), transparent 62%),
                 radial-gradient(900px 780px at 50% 120%, rgba(45, 212, 191, 0.18), transparent 65%),
                 ${surfaceGradient}`
              : `radial-gradient(1200px 800px at -20% -20%, rgba(56, 189, 248, 0.18), transparent 60%),
                 radial-gradient(1100px 760px at 120% -10%, rgba(129, 140, 248, 0.14), transparent 58%),
                 radial-gradient(880px 840px at 50% 120%, rgba(16, 185, 129, 0.16), transparent 62%),
                 ${surfaceGradient}`,
            color: theme.palette.text.primary,
            minHeight: '100vh',
            transition: 'background 260ms ease, color 260ms ease',
            backgroundAttachment: 'fixed',
          },
          '*::-webkit-scrollbar': {
            width: 10,
            height: 10,
          },
          '*::-webkit-scrollbar-track': {
            background: alpha(theme.palette.background.default, 0.6),
          },
          '*::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.primary.main, isDark ? 0.35 : 0.45),
            borderRadius: 999,
          },
          '*, *::before, *::after': {
            boxSizing: 'border-box',
          },
          a: {
            color: 'inherit',
            textDecoration: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.background.paper,
            backgroundImage: surfaceGradient,
            border: translucentBorder,
            boxShadow: glowShadow,
            backdropFilter: 'blur(24px)',
            transition: 'transform 200ms ease, box-shadow 200ms ease',
            position: 'relative',
            isolation: 'isolate',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.white, isDark ? 0.05 : 0.22)}`,
            },
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: hoverGlow,
            },
          },
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: translucentBorder,
            backgroundImage: surfaceGradient,
          },
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: {
            backgroundColor: alpha(theme.palette.background.paper, isDark ? 0.72 : 0.82),
            backdropFilter: 'blur(18px)',
            borderBottom: `1px solid ${alpha(borderColor, 0.65)}`,
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: 64,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 600,
            letterSpacing: '0.04em',
            paddingInline: 20,
            paddingBlock: 10,
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            boxShadow: 'none',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: hoverGlow,
            },
          },
          containedPrimary: {
            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: '#05070f',
          },
          outlined: {
            borderColor: alpha(theme.palette.primary.main, 0.32),
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              borderColor: alpha(theme.palette.primary.main, 0.6),
              backgroundColor: alpha(theme.palette.primary.main, 0.18),
            },
          },
          text: {
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            transition: 'transform 160ms ease, box-shadow 160ms ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.16),
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            backdropFilter: 'blur(14px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            fontWeight: 500,
            color: theme.palette.primary.contrastText,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: alpha(borderColor, 0.8),
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            transition: 'background 160ms ease, transform 160ms ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              transform: 'translateX(2px)',
            },
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.18),
              color: theme.palette.primary.contrastText,
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            border: translucentBorder,
            backgroundImage: surfaceGradient,
            boxShadow: glowShadow,
            backdropFilter: 'blur(18px)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: translucentBorder,
            backgroundImage: surfaceGradient,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottomColor: alpha(borderColor, 0.65),
          },
          head: {
            color: theme.palette.text.primary,
            fontWeight: 600,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            borderRadius: 14,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor,
          },
          root: {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(theme.palette.primary.main, 0.6),
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}`,
            },
          },
          input: {
            paddingBlock: 12,
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: alpha(theme.palette.text.secondary, 0.9),
            '&.Mui-focused': {
              color: theme.palette.primary.main,
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            padding: '12px 16px',
            border: `1px solid ${alpha(theme.palette.common.white, isDark ? 0.08 : 0.18)}`,
            boxShadow: hoverGlow,
            backgroundImage: 'none',
          },
          filledSuccess: {
            backgroundImage: `linear-gradient(140deg, ${alpha(theme.palette.success.main, 0.92)}, ${alpha(theme.palette.success.main, 0.78)})`,
            color: '#041013',
          },
          filledError: {
            backgroundImage: `linear-gradient(140deg, ${alpha(theme.palette.error.main, 0.9)}, ${alpha(theme.palette.error.main, 0.76)})`,
          },
          filledInfo: {
            backgroundImage: `linear-gradient(140deg, ${alpha(theme.palette.info.main, 0.92)}, ${alpha(theme.palette.primary.main, 0.78)})`,
            color: '#051016',
          },
          filledWarning: {
            backgroundImage: `linear-gradient(140deg, ${alpha(theme.palette.warning.main, 0.92)}, ${alpha(theme.palette.warning.main, 0.74)})`,
            color: '#110b05',
          },
        },
      },
      MuiSnackbar: {
        styleOverrides: {
          root: {
            '& .MuiPaper-root': {
              borderRadius: 18,
              border: translucentBorder,
              boxShadow: glowShadow,
              backgroundImage: surfaceGradient,
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            height: 8,
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
          bar: {
            borderRadius: 999,
            backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: theme.palette.primary.main,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': {
              color: '#05070f',
              '& + .MuiSwitch-track': {
                backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                opacity: 1,
              },
            },
          },
          track: {
            borderRadius: 999,
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            opacity: 1,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 4,
            borderRadius: 999,
            backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.04em',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            border: translucentBorder,
            backgroundImage: surfaceGradient,
            boxShadow: glowShadow,
            backdropFilter: 'blur(18px)',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 10,
            padding: '6px 10px',
            backgroundColor: alpha(theme.palette.common.black, isDark ? 0.72 : 0.82),
            color: theme.palette.common.white,
            boxShadow: '0 12px 30px rgba(3,10,28,0.55)',
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(theme.palette.common.black, 0.6),
            backdropFilter: 'blur(12px)',
          },
        },
      },
      MuiDataGrid: {
        defaultProps: {
          density: 'compact',
          disableRowSelectionOnClick: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: translucentBorder,
            backgroundImage: surfaceGradient,
            color: theme.palette.text.primary,
            boxShadow: glowShadow,
            '--DataGrid-containerBackground': 'transparent',
          },
          columnHeaders: {
            backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
            borderBottom: `1px solid ${alpha(borderColor, 0.75)}`,
            backdropFilter: 'blur(10px)',
          },
          row: {
            borderBottom: `1px solid ${alpha(borderColor, 0.55)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
          },
          toolbarContainer: {
            padding: theme.spacing(1.5),
            borderBottom: `1px solid ${alpha(borderColor, 0.6)}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.78),
          },
        },
      },
    },
  });

  return theme;
}

const defaultTheme = createNeoTheme('light');
export default defaultTheme;
