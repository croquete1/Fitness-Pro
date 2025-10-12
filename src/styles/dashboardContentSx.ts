import type { SxProps, Theme } from '@mui/material/styles';

/**
 * Base responsive container styles for dashboard content sections.
 * Keeps a comfortable max width while preserving gutter space on all breakpoints.
 */
export const dashboardContentSx: SxProps<Theme> = {
  width: '100%',
  boxSizing: 'border-box',
  mx: 'auto',
  px: { xs: 2, sm: 2.5, md: 3, lg: 4 },
  py: { xs: 2.5, md: 3, lg: 3.5 },
  maxWidth: {
    xs: '100%',
    sm: 720,
    md: 960,
    lg: 1180,
    xl: 1340,
  },
};

/**
 * Helper to merge the dashboard container styles with local overrides.
 */
export function withDashboardContentSx(
  ...sx: Array<SxProps<Theme> | undefined>
): SxProps<Theme> {
  const extras = sx.filter(Boolean) as SxProps<Theme>[];
  return extras.length === 0
    ? dashboardContentSx
    : ([dashboardContentSx, ...extras] as SxProps<Theme>);
}
