import { useEffect, useState } from 'react';
import { tokens } from '../design/tokens';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts } from '../store/productsSlice';
import { Button } from './Button';
import { ProductCard } from './ProductCard';

export function ProductList() {
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.cart.searchQuery);
  const { items, page, totalPages, total, status, error } = useAppSelector((state) => state.products);
  const [requestedPage, setRequestedPage] = useState(1);

  // New search text -> back to page 1
  useEffect(() => {
    setRequestedPage(1);
  }, [query]);

  // Debounce typing so we don't call the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      void dispatch(fetchProducts({ page: requestedPage, q: query }));
    }, 250);
    return () => clearTimeout(timer);
  }, [dispatch, requestedPage, query]);

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.space.md }}>
        <div style={{ color: tokens.color.muted }}>
          {status === 'loading' ? 'Loading…' : `${total} products`}
        </div>
        <div style={{ display: 'flex', gap: tokens.space.sm, alignItems: 'center' }}>
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setRequestedPage(page - 1)}>
            ← Prev
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setRequestedPage(page + 1)}>
            Next →
          </Button>
        </div>
      </div>

      {error && <div style={{ color: tokens.color.danger }}>{error}</div>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: tokens.space.md,
        }}
      >
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
