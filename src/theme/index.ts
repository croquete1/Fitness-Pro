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
  const cardBgFallback = isDark ? 'rgba(10, 18, 32, 0.88)' : 'rgba(255, 255, 255, 0.94)';
  const fieldBgFallback = isDark ? 'rgba(10, 16, 38, 0.86)' : 'rgba(255, 255, 255, 0.98)';
  const fieldBorderFallback = isDark ? 'rgba(126, 150, 255, 0.32)' : 'rgba(87, 122, 255, 0.28)';
  const fieldFocusBorderFallback = isDark ? 'rgba(75, 231, 255, 0.45)' : '#0093c7';
  const fieldFocusRingFallback = isDark ? 'rgba(82, 168, 255, 0.32)' : 'rgba(0, 148, 255, 0.22)';
  const fieldShadowFallback = isDark
    ? '0 18px 36px rgba(5, 12, 32, 0.44)'
    : '0 14px 34px rgba(12, 34, 66, 0.08)';
  const placeholderFallback = isDark ? 'rgba(194, 207, 253, 0.58)' : 'rgba(12, 34, 66, 0.5)';
  const fieldDisabledBgFallback = isDark ? 'rgba(10, 16, 30, 0.7)' : 'rgba(12, 34, 66, 0.08)';
  const fieldDisabledFgFallback = isDark ? 'rgba(198, 206, 248, 0.48)' : 'rgba(12, 34, 66, 0.45)';
  const sidebarHoverFallback = isDark ? 'rgba(75, 231, 255, 0.1)' : 'rgba(0, 148, 255, 0.1)';
  const sidebarActiveFallback = isDark ? 'rgba(127, 91, 255, 0.18)' : 'rgba(127, 91, 255, 0.14)';
  const sidebarFgFallback = isDark ? '#e6ebff' : '#0b1020';
  const sidebarMutedFallback = isDark ? '#b8c8f8' : '#56637f';
  const btnPrimaryHoverFallback = isDark ? '#00b2d6' : '#0093c7';
  const btnPrimaryShadowFallback = isDark
    ? '0 10px 22px rgba(0, 178, 214, 0.28)'
    : '0 6px 18px rgba(0, 148, 255, 0.25)';
  const btnOutlineBorderFallback = isDark ? 'rgba(114, 137, 255, 0.34)' : 'rgba(12, 34, 66, 0.18)';
  const btnOutlineBgFallback = isDark ? 'rgba(14, 22, 37, 0.3)' : 'transparent';
  const btnOutlineFgFallback = isDark ? '#e6ebff' : '#0b1020';
  const btnGhostFgFallback = btnOutlineFgFallback;
  const btnGhostBorderFallback = isDark ? 'rgba(114, 137, 255, 0.16)' : 'transparent';
  const btnGhostHoverFallback = isDark ? 'rgba(75, 231, 255, 0.18)' : 'rgba(0, 148, 255, 0.16)';
  const btnDangerHoverFallback = isDark ? '#f87171' : '#dc2626';
  const btnDangerBorderFallback = isDark ? 'rgba(248, 113, 113, 0.62)' : '#dc2626';
  const btnDangerShadowFallback = isDark
    ? '0 10px 26px rgba(248, 113, 113, 0.28)'
    : '0 6px 18px rgba(239, 68, 68, 0.25)';
  const chipBgFallback = isDark ? 'rgba(10, 18, 32, 0.88)' : 'rgba(255, 255, 255, 0.82)';
  const chipBorderFallback = isDark ? 'rgba(96, 136, 255, 0.42)' : 'rgba(87, 122, 255, 0.28)';
  const chipFgFallback = isDark ? '#dbe9ff' : '#0b1020';

  const cardBgVar = `var(--card-bg, ${cardBgFallback})`;
  const fieldBgVar = `var(--field-bg, ${fieldBgFallback})`;
  const fieldBorderVar = `var(--field-border, ${fieldBorderFallback})`;
  const fieldShadowVar = `var(--field-shadow, ${fieldShadowFallback})`;
  const fieldFocusBorderVar = `var(--field-focus-border, ${fieldFocusBorderFallback})`;
  const fieldFocusRingVar = `var(--field-focus-ring, ${fieldFocusRingFallback})`;
  const fieldPlaceholderVar = `var(--field-placeholder, ${placeholderFallback})`;
  const fieldDisabledBgVar = `var(--field-disabled-bg, ${fieldDisabledBgFallback})`;
  const fieldDisabledFgVar = `var(--field-disabled-fg, ${fieldDisabledFgFallback})`;
  const sidebarHoverVar = `var(--sidebar-hover, ${sidebarHoverFallback})`;
  const sidebarActiveVar = `var(--sidebar-active, ${sidebarActiveFallback})`;
  const sidebarFgVar = `var(--sidebar-fg, ${sidebarFgFallback})`;
  const sidebarMutedVar = `var(--sidebar-muted, ${sidebarMutedFallback})`;
  const motionFastVar = 'var(--motion-fast, 180ms)';
  const motionMediumVar = 'var(--motion-medium, 220ms)';
  const motionEaseVar = 'var(--motion-ease, ease)';
  const btnPrimaryBgVar = `var(--btn-primary-bg, linear-gradient(180deg, ${palette.primary.main}, ${palette.primary.dark}))`;
  const btnPrimaryHoverVar = `var(--btn-primary-hover, ${btnPrimaryHoverFallback})`;
  const btnPrimaryFgVar = `var(--btn-primary-fg, var(--on-primary, ${theme.palette.primary.contrastText}))`;
  const btnPrimaryBorderVar = `var(--btn-primary-bd, ${palette.primary.dark})`;
  const btnPrimaryShadowVar = `var(--btn-primary-shadow, ${btnPrimaryShadowFallback})`;
  const btnOutlineBgVar = `var(--btn-outline-bg, ${btnOutlineBgFallback})`;
  const btnOutlineBorderVar = `var(--btn-outline-bd, ${btnOutlineBorderFallback})`;
  const btnOutlineFgVar = `var(--btn-outline-fg, ${btnOutlineFgFallback})`;
  const btnGhostFgVar = `var(--btn-ghost-fg, ${btnGhostFgFallback})`;
  const btnGhostBorderVar = `var(--btn-ghost-bd, ${btnGhostBorderFallback})`;
  const btnGhostHoverVar = `var(--btn-ghost-hover, ${btnGhostHoverFallback})`;
  const btnDangerBgVar =
    'var(--btn-danger-bg, linear-gradient(180deg, #ef4444, #dc2626))';
  const btnDangerHoverVar = `var(--btn-danger-hover, ${btnDangerHoverFallback})`;
  const btnDangerFgVar = 'var(--btn-danger-fg, var(--on-danger, #fff))';
  const btnDangerBorderVar = `var(--btn-danger-bd, ${btnDangerBorderFallback})`;
  const btnDangerShadowVar = `var(--btn-danger-shadow, ${btnDangerShadowFallback})`;
  const chipBgVar = `var(--chip-bg, ${chipBgFallback})`;
  const chipBorderVar = `var(--chip-border, ${chipBorderFallback})`;
  const chipFgVar = `var(--chip-fg, ${chipFgFallback})`;

  theme = createTheme(theme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
          },
          body: {
            backgroundColor: `var(--bg, ${theme.palette.background.default})`,
            backgroundImage: isDark
              ? `radial-gradient(1200px 800px at -15% -20%, rgba(59, 130, 246, 0.16), transparent 60%),
                 radial-gradient(1000px 760px at 120% -20%, rgba(217, 70, 239, 0.12), transparent 62%),
                 radial-gradient(900px 780px at 50% 120%, rgba(45, 212, 191, 0.18), transparent 65%),
                 ${surfaceGradient}`
              : `radial-gradient(1200px 800px at -20% -20%, rgba(56, 189, 248, 0.18), transparent 60%),
                 radial-gradient(1100px 760px at 120% -10%, rgba(129, 140, 248, 0.14), transparent 58%),
                 radial-gradient(880px 840px at 50% 120%, rgba(16, 185, 129, 0.16), transparent 62%),
                 ${surfaceGradient}`,
            color: `var(--fg, ${theme.palette.text.primary})`,
            minHeight: '100vh',
            transition: `background ${motionMediumVar} ${motionEaseVar}, color ${motionMediumVar} ${motionEaseVar}`,
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
            backgroundColor: cardBgVar,
            backgroundImage: 'none',
            border: `1px solid ${fieldBorderVar}`,
            boxShadow: `var(--shadow-1, ${glowShadow})`,
            backdropFilter: 'blur(24px)',
            transition: `transform ${motionMediumVar} ${motionEaseVar}, box-shadow ${motionMediumVar} ${motionEaseVar}`,
            position: 'relative',
            isolation: 'isolate',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              boxShadow: `inset 0 0 0 1px var(--border, ${borderColor})`,
            },
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `var(--shadow-2, ${hoverGlow})`,
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
            transition: `transform ${motionFastVar} ${motionEaseVar}, box-shadow ${motionFastVar} ${motionEaseVar}, background-color ${motionFastVar} ${motionEaseVar}`,
            boxShadow: 'var(--btn-shadow, none)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `var(--btn-hover-shadow, ${hoverGlow})`,
            },
          },
          containedPrimary: {
            backgroundImage: btnPrimaryBgVar,
            color: btnPrimaryFgVar,
            border: `1px solid ${btnPrimaryBorderVar}`,
            boxShadow: btnPrimaryShadowVar,
            '&:hover': {
              backgroundColor: btnPrimaryHoverVar,
              backgroundImage: btnPrimaryBgVar,
              boxShadow: btnPrimaryShadowVar,
            },
          },
          outlined: {
            borderColor: btnOutlineBorderVar,
            color: btnOutlineFgVar,
            backgroundColor: btnOutlineBgVar,
            '&:hover': {
              borderColor: btnOutlineBorderVar,
              backgroundColor: sidebarHoverVar,
            },
          },
          text: {
            color: btnGhostFgVar,
            '&:hover': {
              backgroundColor: sidebarHoverVar,
            },
          },
          containedError: {
            backgroundImage: btnDangerBgVar,
            color: btnDangerFgVar,
            border: `1px solid ${btnDangerBorderVar}`,
            boxShadow: btnDangerShadowVar,
            '&:hover': {
              backgroundColor: btnDangerHoverVar,
              boxShadow: btnDangerShadowVar,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: `var(--btn-ghost-bg, ${alpha(theme.palette.primary.main, 0.08)})`,
            border: `1px solid ${btnGhostBorderVar}`,
            color: btnGhostFgVar,
            transition: `transform ${motionFastVar} ${motionEaseVar}, box-shadow ${motionFastVar} ${motionEaseVar}, background-color ${motionFastVar} ${motionEaseVar}`,
            '&:hover': {
              backgroundColor: btnGhostHoverVar,
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
            border: `1px solid ${chipBorderVar}`,
            backgroundColor: chipBgVar,
            fontWeight: 500,
            color: chipFgVar,
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
            color: sidebarFgVar,
            transition: `background-color ${motionFastVar} ${motionEaseVar}, color ${motionFastVar} ${motionEaseVar}, transform ${motionFastVar} ${motionEaseVar}`,
            '& .MuiListItemIcon-root': {
              color: sidebarMutedVar,
              transition: `color ${motionFastVar} ${motionEaseVar}`,
            },
            '&:hover': {
              backgroundColor: sidebarHoverVar,
              transform: 'translateX(2px)',
              color: sidebarFgVar,
            },
            '&:hover .MuiListItemIcon-root': {
              color: sidebarFgVar,
            },
            '&.Mui-selected': {
              backgroundColor: sidebarActiveVar,
              color: sidebarFgVar,
            },
            '&.Mui-selected .MuiListItemIcon-root': {
              color: sidebarFgVar,
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            border: `1px solid ${fieldBorderVar}`,
            background: cardBgVar,
            boxShadow: `var(--shadow-1, ${glowShadow})`,
            backdropFilter: 'blur(18px)',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            color: sidebarFgVar,
            transition: `background-color ${motionFastVar} ${motionEaseVar}, color ${motionFastVar} ${motionEaseVar}`,
            '&:hover': {
              backgroundColor: sidebarHoverVar,
              color: sidebarFgVar,
            },
            '&.Mui-selected': {
              backgroundColor: sidebarActiveVar,
              color: sidebarFgVar,
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${fieldBorderVar}`,
            background: `var(--sidebar-bg, ${cardBgFallback})`,
            color: sidebarFgVar,
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
            borderRadius: 18,
            color: `var(--fg, ${theme.palette.text.primary})`,
            transition: `color ${motionFastVar} ${motionEaseVar}`,
          },
          input: {
            paddingBlock: 12,
            color: 'inherit',
            '&::placeholder': {
              color: fieldPlaceholderVar,
              opacity: 1,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          notchedOutline: {
            borderColor: fieldBorderVar,
            transition: `border-color ${motionFastVar} ${motionEaseVar}`,
          },
          root: {
            borderRadius: 18,
            background: fieldBgVar,
            boxShadow: fieldShadowVar,
            transition: `background ${motionFastVar} ${motionEaseVar}, box-shadow ${motionFastVar} ${motionEaseVar}`,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: fieldBorderVar,
            },
            '&.Mui-focused': {
              boxShadow: fieldFocusRingVar,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: fieldFocusBorderVar,
            },
            '&.Mui-disabled': {
              backgroundColor: fieldDisabledBgVar,
              color: fieldDisabledFgVar,
            },
            '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
              borderColor: fieldBorderVar,
            },
          },
          input: {
            paddingBlock: 12,
            '&.Mui-disabled': {
              color: fieldDisabledFgVar,
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            border: `1px solid ${fieldBorderVar}`,
            background: cardBgVar,
            boxShadow: `var(--shadow-1, ${glowShadow})`,
            backdropFilter: 'blur(18px)',
          },
          listbox: {
            paddingBlock: 8,
          },
          option: {
            borderRadius: 12,
            color: sidebarFgVar,
            transition: `background-color ${motionFastVar} ${motionEaseVar}, color ${motionFastVar} ${motionEaseVar}`,
            '&[aria-selected="true"]': {
              backgroundColor: sidebarActiveVar,
              color: sidebarFgVar,
            },
            '&.Mui-focused': {
              backgroundColor: sidebarHoverVar,
              color: sidebarFgVar,
            },
          },
          noOptions: {
            color: sidebarMutedVar,
          },
          loading: {
            color: sidebarMutedVar,
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: fieldPlaceholderVar,
            transition: `color ${motionFastVar} ${motionEaseVar}`,
            '&.Mui-focused': {
              color: `var(--primary, ${theme.palette.primary.main})`,
            },
            '&.Mui-disabled': {
              color: fieldDisabledFgVar,
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color: fieldPlaceholderVar,
            marginLeft: 0,
            transition: `color ${motionFastVar} ${motionEaseVar}`,
            '&.Mui-error': {
              color: 'var(--danger-strong, var(--danger, #ef4444))',
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            padding: '12px 16px',
            border: `1px solid ${fieldBorderVar}`,
            boxShadow: `var(--shadow-1, ${hoverGlow})`,
            background: cardBgVar,
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
