import { useState } from 'react';
import type { Totals } from '../api/client';
import { tokens } from '../design/tokens';
import { formatINR } from '../format';
import { applyCoupon, removeCoupon } from '../store/cartSlice';
import { useAppDispatch } from '../store/hooks';
import { Button } from './Button';

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: bold ? tokens.font.weightBold : tokens.font.weightRegular,
      }}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function CartSummary({ totals, couponCode }: { totals: Totals; couponCode: string | null }) {
  const dispatch = useAppDispatch();
  const [code, setCode] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.space.xs }}>
      {couponCode ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: tokens.color.success }}>
          <span>Coupon {couponCode} applied</span>
          <Button variant="link" size="sm" onClick={() => dispatch(removeCoupon())}>
            Remove
          </Button>
        </div>
      ) : (
        <form
          style={{ display: 'flex', gap: tokens.space.sm }}
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim()) void dispatch(applyCoupon(code.trim()));
            setCode('');
          }}
        >
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Coupon code"
            style={{
              flex: 1,
              padding: tokens.space.xs,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.sm,
            }}
          />
          <Button type="submit" variant="secondary" size="sm">
            Apply
          </Button>
        </form>
      )}

      <Row label="Subtotal" value={formatINR(totals.subtotal)} />
      {totals.discount > 0 && <Row label="Discount" value={`− ${formatINR(totals.discount)}`} />}
      <Row label="GST" value={formatINR(totals.tax)} />
      <Row label="Shipping" value={totals.shipping === 0 ? 'Free' : formatINR(totals.shipping)} />
      <Row label="Total" value={formatINR(totals.total)} bold />
    </div>
  );
}
