import { useState, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { tokens } from '../design/tokens';

type Variant = 'primary' | 'secondary' | 'link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
}

/** The only button ShopLite components should use. */
export function Button({ variant = 'primary', size = 'md', style, disabled, ...rest }: ButtonProps) {
  const [hovered, setHovered] = useState(false);

  const base: CSSProperties = {
    border: `1px solid ${tokens.color.brand}`,
    borderRadius: tokens.radius.md,
    padding: size === 'sm' ? `${tokens.space.xs}px ${tokens.space.sm}px` : `${tokens.space.sm}px ${tokens.space.md}px`,
    fontSize: size === 'sm' ? tokens.font.small : tokens.font.body,
    fontWeight: tokens.font.weightBold,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const variants: Record<Variant, CSSProperties> = {
    primary: {
      background: hovered && !disabled ? tokens.color.brandHover : tokens.color.brand,
      color: tokens.color.surface,
    },
    secondary: { background: tokens.color.surface, color: tokens.color.brand },
    link: { background: 'transparent', border: 'none', color: tokens.color.muted, padding: 0 },
  };

  return (
    <button
      {...rest}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...variants[variant], ...style }}
    />
  );
}
