/** Typed wrappers around the ShopLite API. Vite proxies /api to :4000. */

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  inStock: boolean;
}

export interface ProductPage {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Totals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface CartLineDto {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface CartDto {
  id: number;
  customerId: number | null;
  couponCode: string | null;
  status: 'open' | 'checked_out';
  items: CartLineDto[];
  totals: Totals;
}

export interface OrderDto extends Totals {
  id: number;
  paymentReference: string | null;
  createdAt: string;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error ?? `${method} ${path} failed with ${response.status}`);
  }
  return data as T;
}

export const api = {
  listProducts: ({ page, q }: { page: number; q: string }) =>
    request<ProductPage>('GET', `/api/products?page=${page}&q=${encodeURIComponent(q)}`),
  createCart: () => request<CartDto>('POST', '/api/carts', {}),
  getCart: (cartId: number) => request<CartDto>('GET', `/api/carts/${cartId}`),
  addItem: (cartId: number, productId: number, quantity: number) =>
    request<CartDto>('POST', `/api/carts/${cartId}/items`, { productId, quantity }),
  removeItem: (cartId: number, productId: number) =>
    request<CartDto>('DELETE', `/api/carts/${cartId}/items/${productId}`),
  applyCoupon: (cartId: number, code: string) => request<CartDto>('POST', `/api/carts/${cartId}/coupon`, { code }),
  removeCoupon: (cartId: number) => request<CartDto>('DELETE', `/api/carts/${cartId}/coupon`),
  checkout: (cartId: number) => request<OrderDto>('POST', '/api/orders', { cartId }),
};
