/**
 * ShopLite design tokens. Components must use these instead of raw values.
 * See docs/design-system.md.
 */
export const tokens = {
  color: {
    brand: '#E8590C',
    brandHover: '#C2410C',
    text: '#1F2937',
    muted: '#6B7280',
    surface: '#FFFFFF',
    canvas: '#F8FAFC',
    border: '#E2E8F0',
    danger: '#DC2626',
    success: '#15803D',
    highlight: '#FEF3C7',
  },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, pill: 999 },
  font: {
    small: '12px',
    body: '14px',
    title: '18px',
    weightRegular: 400,
    weightBold: 600,
  },
  shadow: { card: '0 1px 2px rgba(15, 23, 42, 0.08)' },
} as const;
