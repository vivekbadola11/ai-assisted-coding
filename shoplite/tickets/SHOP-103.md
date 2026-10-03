# SHOP-103 · Stock went negative for Steel Water Bottle 1L

| Field | Value |
|---|---|
| Type | Bug |
| Priority | High |
| Reporter | Warehouse (Suresh) |
| Status | Needs investigation |

## Description

The stock report shows **-2** units of *Steel Water Bottle 1L* (product 25).
We had 3 in the warehouse. A customer ordered 5 and the order went through.

We also saw a case last month where checkout failed halfway and the stock
of the first item in the cart was reduced anyway.

## What we need

Before anyone changes code, we want to understand **every** way stock can go
wrong today: adding to cart, changing quantity, and checkout.
Please write up the root causes with file and line references.
