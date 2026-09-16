// styles/theme.js
// Single source of truth for the BunkMaster brand palette.
// Mirrors the CSS variables in Auth.css / Landing.css so the header,
// landing page, and auth pages all read from the same colors.

export const tokens = {
  ink: '#16213E',
  inkSoft: '#3A4468',
  bg: '#EEF2F8',
  surface: '#FFFFFF',
  border: '#D8DEE9',

  gold: '#F5B301',
  goldDark: '#D69700',

  primary: '#16213E',
  primaryDeep: '#0F1730',
  primaryLight: '#3A4468',

  critical: '#E8574A',
  success: '#1F9E82',
  successBg: '#EAF7EF',
  criticalBg: '#FDEAEA',
  warningBg: '#FFF6E5',
  warning: '#E59819',

  gradient: 'linear-gradient(160deg, #16213E 0%, #223060 100%)',
};