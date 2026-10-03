# SHOP-106 · Cart panel re-renders on every keystroke

| Field | Value |
|---|---|
| Type | Performance |
| Priority | Medium |
| Reporter | Web team (Rohan) |
| Status | Open |
| Labels | web, redux |

## Description

Typing in the search box makes the whole cart panel re-render on every key.
In development the "renders: N" counter in the cart header climbs by 2 with
each character. On slower phones the search box lags.

React-Redux also logs a warning in the browser console about a selector
returning a different result for the same inputs.

## Steps to reproduce

1. `npm run dev`, open http://localhost:5173
2. Add a product to the cart.
3. Type "bottle" in the search box and watch the cart's render counter.

## Expected

The cart panel only re-renders when the cart changes.
