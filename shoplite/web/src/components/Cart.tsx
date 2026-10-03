import { tokens } from '../design/tokens';
import { useRenderCount } from '../debug/useRenderCount';
import { formatINR } from '../format';
import { checkout, dismissLastOrder, removeFromCart, selectCartView } from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Button } from './Button';
import { CartSummary } from './CartSummary';

export function Cart() {
  const dispatch = useAppDispatch();
  const view = useAppSelector(selectCartView);
  const renders = useRenderCount();

  return (
    <aside
      style={{
        background: tokens.color.surface,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: tokens.radius.md,
        padding: tokens.space.md,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.space.md,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={{ margin: 0, fontSize: tokens.font.title }}>Cart ({view.itemCount})</h2>
        {import.meta.env.DEV && (
          <span title="Dev only: how many times <Cart> has rendered" style={{ fontSize: tokens.font.small, color: tokens.color.muted }}>
            renders: {renders}
          </span>
        )}
      </div>

      {view.lastOrder && (
        <div
          style={{
            background: tokens.color.highlight,
            padding: tokens.space.sm,
            borderRadius: tokens.radius.sm,
          }}
        >
          Order #{view.lastOrder.id} placed, total {formatINR(view.lastOrder.total)}.{' '}
          <Button variant="link" size="sm" onClick={() => dispatch(dismissLastOrder())}>
            Dismiss
          </Button>
        </div>
      )}

      {view.lines.length === 0 ? (
        <div style={{ color: tokens.color.muted }}>Your cart is empty.</div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: tokens.space.sm }}>
          {view.lines.map((line) => (
            <li
              key={line.productId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: tokens.space.sm,
                background: view.query && line.name.toLowerCase().includes(view.query) ? tokens.color.highlight : undefined,
              }}
            >
              <span>
                {line.quantity} × {line.name}
              </span>
              <span style={{ display: 'flex', gap: tokens.space.sm }}>
                {formatINR(line.lineTotal)}
                <Button variant="link" size="sm" aria-label={`Remove ${line.name}`} onClick={() => dispatch(removeFromCart(line.productId))}>
                  ✕
                </Button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {view.totals && view.lines.length > 0 && <CartSummary totals={view.totals} couponCode={view.couponCode} />}

      {view.error && <div style={{ color: tokens.color.danger }}>{view.error}</div>}

      <Button disabled={view.lines.length === 0 || view.status === 'loading'} onClick={() => dispatch(checkout())}>
        Checkout
      </Button>
    </aside>
  );
}
