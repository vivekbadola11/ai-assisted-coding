import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, type Product } from '../api/client';

export interface ProductsState {
  items: Product[];
  page: number;
  totalPages: number;
  total: number;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  page: 1,
  totalPages: 1,
  total: 0,
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetch', (args: { page: number; q: string }) =>
  api.listProducts(args),
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
        state.total = action.payload.total;
        state.status = 'idle';
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Could not load products';
      });
  },
});

export default productsSlice.reducer;
