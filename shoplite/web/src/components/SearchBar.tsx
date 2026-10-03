import { tokens } from '../design/tokens';
import { setSearchQuery } from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export function SearchBar() {
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.cart.searchQuery);

  return (
    <input
      type="search"
      placeholder="Search products…"
      value={query}
      onChange={(event) => dispatch(setSearchQuery(event.target.value))}
      style={{
        width: 320,
        padding: `${tokens.space.sm}px ${tokens.space.md}px`,
        border: `1px solid ${tokens.color.border}`,
        borderRadius: tokens.radius.pill,
        background: tokens.color.surface,
      }}
    />
  );
}
