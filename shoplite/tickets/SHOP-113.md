# SHOP-113 · Minimum order value

| Field | Value |
|---|---|
| Type | Feature |
| Priority | High |
| Reporter | Finance (Ravi) |
| Status | Ready |
| Labels | checkout, api |

## Description

Small orders lose us money: once shipping and payment fees are counted, we make a
loss on anything tiny. Please add a minimum order value at checkout.

## Comments

**Ananya (Product):** Agreed. I'll confirm the exact number and the rules with Finance
and post them here.

**Ananya (Product):** Confirmed with Finance. The minimum is ₹299, measured on subtotal
minus coupon discount (before GST and shipping). Exactly ₹299 is fine. Error text:
"Minimum order value is ₹299". Please also expose the shortfall on the cart so the web
team can show "Add ₹X more" later.
