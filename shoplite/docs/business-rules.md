# ShopLite business rules

These rules are agreed with Product and Finance. The code must follow them.
If the code and this page disagree, the code is wrong (raise a ticket).

## Prices and tax

- Product prices are in Indian rupees (₹) and **exclude GST**.
- GST is **18% on every product**. The rate is configured with `TAX_RATE=0.18`.
- GST is charged on the amount the customer actually pays for the goods:
  **subtotal minus coupon discount**.

## Coupons

- One coupon per cart.
- `percent` coupons take a percentage off the subtotal.
- `flat` coupons take a fixed amount off, and never more than the subtotal.
- A coupon only applies when the subtotal is at least its `min_subtotal`.
- Inactive coupons are rejected.

## Shipping

- Orders with a subtotal of **₹999 or more ship free**.
- The free-shipping check uses the subtotal **before** any coupon discount.
  (Product decision, March 2026. Do not change without Product sign-off.)
- Below ₹999, shipping is a flat **₹49**.

## Rounding

- Every money value (subtotal, discount, tax, shipping, total) is rounded to
  2 decimal places (paise) with `roundMoney()` from `api/src/lib/money.ts`.
- The total is the sum of the **rounded** parts, so the numbers on the
  invoice always add up.

### Worked example

2 × Cotton Crew T-Shirt at ₹499 with coupon `SAVE10` (10%):

| Line | Amount |
|---|---|
| Subtotal | ₹998.00 |
| Discount (10%) | − ₹99.80 |
| GST 18% on ₹898.20 | ₹161.68 |
| Shipping (subtotal below ₹999) | ₹49.00 |
| **Total** | **₹1,108.88** |

## Stock

- A product can't be sold beyond its stock. Stock must never go negative.
- Stock is taken at checkout. If any item can't be fulfilled, the whole
  checkout fails and nothing is taken.

## Discontinued products

- Discontinued products have `active = 0`. They are hidden from the catalogue
  and can't be added to a cart.
- A cart may still contain a product that was discontinued later. Checkout
  must then fail with a clear message asking the customer to remove it.
