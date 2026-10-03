import type { Product } from '../api/client';
import { formatINR } from '../format';
import { addToCart } from '../store/cartSlice';
import { useAppDispatch } from '../store/hooks';

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 10,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>{product.category}</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{product.name}</div>
      <div style={{ color: '#333' }}>{formatINR(product.price)}</div>
      {product.inStock ? (
        <button
          onClick={() => dispatch(addToCart({ productId: product.id }))}
          style={{
            marginTop: 'auto',
            background: '#ff6a00',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '7px 12px',
            cursor: 'pointer',
          }}
        >
          Add to cart
        </button>
      ) : (
        <div style={{ marginTop: 'auto', color: '#d33', fontSize: 13 }}>Out of stock</div>
      )}
    </div>
  );
}
