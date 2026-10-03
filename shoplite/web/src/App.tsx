import { useEffect } from 'react';
import { Cart } from './components/Cart';
import { ProductList } from './components/ProductList';
import { SearchBar } from './components/SearchBar';
import { tokens } from './design/tokens';
import { loadCart } from './store/cartSlice';
import { useAppDispatch } from './store/hooks';

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(loadCart());
  }, [dispatch]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: tokens.space.lg }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: tokens.space.lg,
        }}
      >
        <h1 style={{ margin: 0, color: tokens.color.brand }}>ShopLite</h1>
        <SearchBar />
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: tokens.space.lg, alignItems: 'start' }}>
        <ProductList />
        <Cart />
      </div>
    </div>
  );
}
