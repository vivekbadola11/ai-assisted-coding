import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected, type PayloadAction } from '@reduxjs/toolkit';
import { api, type CartDto, type CartLineDto, type OrderDto, type Totals } from '../api/client';
import type { RootState } from './index';

const CART_ID_KEY = 'shoplite.cartId';

export interface CartState {
  cartId: number | null;
  items: CartLineDto[];
  couponCode: string | null;
  totals: Totals | null;
  searchQuery: string;
  lastOrder: OrderDto | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: CartState = {
  cartId: null,
  items: [],
  couponCode: null,
  totals: null,
  searchQuery: '',
  lastOrder: null,
  status: 'idle',
  error: null,
};

function requireCartId(state: unknown): number {
  const id = (state as RootState).cart.cartId;
  if (id === null) throw new Error('Cart is not loaded yet');
  return id;
}

/** Load the saved cart, or create a new one if there isn't one. */
export const loadCart = createAsyncThunk('cart/load', async (): Promise<CartDto> => {
  const saved = localStorage.getItem(CART_ID_KEY);
  if (saved) {
    try {
      const cart = await api.getCart(Number(saved));
      if (cart.status === 'open') return cart;
    } catch {
      // Saved cart no longer exists: fall through and create a new one.
    }
  }
  const cart = await api.createCart();
  localStorage.setItem(CART_ID_KEY, String(cart.id));
  return cart;
});

export const addToCart = createAsyncThunk(
  'cart/add',
  ({ productId, quantity = 1 }: { productId: number; quantity?: number }, { getState }) =>
    api.addItem(requireCartId(getState()), productId, quantity),
);

export const removeFromCart = createAsyncThunk('cart/remove', (productId: number, { getState }) =>
  api.removeItem(requireCartId(getState()), productId),
);

export const applyCoupon = createAsyncThunk('cart/applyCoupon', (code: string, { getState }) =>
  api.applyCoupon(requireCartId(getState()), code),
);

export const removeCoupon = createAsyncThunk('cart/removeCoupon', (_: void, { getState }) =>
  api.removeCoupon(requireCartId(getState())),
);

/** Place the order, then start a fresh cart. */
export const checkout = createAsyncThunk('cart/checkout', async (_: void, { getState }) => {
  const order = await api.checkout(requireCartId(getState()));
  const cart = await api.createCart();
  localStorage.setItem(CART_ID_KEY, String(cart.id));
  return { order, cart };
});

function receiveCart(state: CartState, cart: CartDto): void {
  state.cartId = cart.id;
  state.items = cart.items;
  state.couponCode = cart.couponCode;
  state.totals = cart.totals;
  state.status = 'idle';
  state.error = null;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    dismissLastOrder(state) {
      state.lastOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkout.fulfilled, (state, action) => {
        receiveCart(state, action.payload.cart);
        state.lastOrder = action.payload.order;
      })
      .addMatcher(isFulfilled(loadCart, addToCart, removeFromCart, applyCoupon, removeCoupon), (state, action) => {
        receiveCart(state, action.payload);
      })
      .addMatcher(isPending(loadCart, addToCart, removeFromCart, applyCoupon, removeCoupon, checkout), (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(isRejected(loadCart, addToCart, removeFromCart, applyCoupon, removeCoupon, checkout), (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Something went wrong';
      });
  },
});

export const { setSearchQuery, dismissLastOrder } = cartSlice.actions;
export default cartSlice.reducer;

/** Everything the cart panel renders. */
export const selectCartView = (state: RootState) => ({
  lines: state.cart.items.map((item) => ({ ...item, lineTotal: item.unitPrice * item.quantity })),
  itemCount: state.cart.items.reduce((count, item) => count + item.quantity, 0),
  totals: state.cart.totals,
  couponCode: state.cart.couponCode,
  // Lets the cart highlight lines that match what the shopper is searching for.
  query: state.cart.searchQuery.toLowerCase(),
  status: state.cart.status,
  error: state.cart.error,
  lastOrder: state.cart.lastOrder,
});
