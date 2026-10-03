# ShopLite design system

All UI is styled from `web/src/design/tokens.ts`. The rules:

1. **Colours** come from `tokens.color`. No hex codes in components.
2. **Spacing** comes from `tokens.space` (4, 8, 16, 24, 32 px). No other values.
3. **Corner radius** comes from `tokens.radius`.
4. **Font sizes** come from `tokens.font` (12, 14, 18 px).
5. **Buttons** use `<Button>` from `web/src/components/Button.tsx`, never a raw `<button>`.
   - `primary`: the main action on a surface (Add to cart, Checkout)
   - `secondary`: other actions (pagination, Apply coupon)
   - `link`: low-emphasis actions (Remove, Dismiss)
6. Error text uses `tokens.color.danger`; success uses `tokens.color.success`.

## Tokens at a glance

| Token | Value |
|---|---|
| `color.brand` | `#E8590C` |
| `color.brandHover` | `#C2410C` |
| `color.text` | `#1F2937` |
| `color.muted` | `#6B7280` |
| `color.border` | `#E2E8F0` |
| `color.danger` | `#DC2626` |
| `space.sm / md / lg` | 8 / 16 / 24 |
| `radius.sm / md` | 4 / 8 |
