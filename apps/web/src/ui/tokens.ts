export const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "24px",
  6: "32px",
  7: "48px",
  8: "64px",
} as const;

export const fontSizes = {
  12: "12px",
  14: "14px",
  16: "16px",
  18: "18px",
  20: "20px",
  24: "24px",
  32: "32px",
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

export const lineHeights = {
  body: 1.5,
  heading: 1.25,
} as const;

export const radius = {
  control: "4px",
  card: "8px",
  modal: "12px",
} as const;

export const shadow = {
  card: "var(--ui-shadow-card)",
  modal: "var(--ui-shadow-modal)",
} as const;

export const motion = {
  micro: "150ms",
  page: "250ms",
  easing: "ease-out",
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  drawer: 30,
  modal: 40,
  toast: 50,
  palette: 60,
} as const;

export const iconSizes = {
  sm: 16,
  md: 20,
} as const;

export const colors = {
  bg: "var(--ui-color-bg)",
  surface: "var(--ui-color-surface)",
  surfaceRaised: "var(--ui-color-surface-raised)",
  fg: "var(--ui-color-fg)",
  muted: "var(--ui-color-muted)",
  border: "var(--ui-color-border)",
  borderStrong: "var(--ui-color-border-strong)",
  primary: "var(--ui-color-primary)",
  primaryHover: "var(--ui-color-primary-hover)",
  primaryFg: "var(--ui-color-primary-fg)",
  accent: "var(--ui-color-accent)",
  success: "var(--ui-color-success)",
  successBg: "var(--ui-color-success-bg)",
  warning: "var(--ui-color-warning)",
  warningBg: "var(--ui-color-warning-bg)",
  danger: "var(--ui-color-danger)",
  dangerBg: "var(--ui-color-danger-bg)",
  info: "var(--ui-color-info)",
  infoBg: "var(--ui-color-info-bg)",
  focus: "var(--ui-color-focus)",
  overlay: "var(--ui-color-overlay)",
} as const;

export const tokens = {
  spacing,
  fontSizes,
  fontWeights,
  lineHeights,
  radius,
  shadow,
  motion,
  zIndex,
  iconSizes,
  colors,
} as const;

export type SpacingToken = keyof typeof spacing;
export type FontSizeToken = keyof typeof fontSizes;
export type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

export const toneColorVariables: Record<Tone, { foreground: string; background: string }> = {
  neutral: { foreground: "var(--ui-color-fg)", background: "var(--ui-color-surface)" },
  brand: { foreground: "var(--ui-color-primary)", background: "var(--ui-color-info-bg)" },
  success: { foreground: "var(--ui-color-success)", background: "var(--ui-color-success-bg)" },
  warning: { foreground: "var(--ui-color-warning)", background: "var(--ui-color-warning-bg)" },
  danger: { foreground: "var(--ui-color-danger)", background: "var(--ui-color-danger-bg)" },
  info: { foreground: "var(--ui-color-info)", background: "var(--ui-color-info-bg)" },
};
