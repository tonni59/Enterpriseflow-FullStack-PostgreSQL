
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, money } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";

export default function Cart() {
  const { user, loading } = useAuth();

  const [items, setItems] = useState([]);
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loadingCart, setLoadingCart] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);

  // Load cart items
  async function loadCart() {
    try {
      setLoadingCart(true);

      const response = await api("/cart");

      setItems(Array.isArray(response.items) ? response.items : []);
    } catch (error) {
      setMessage(error.message || "Unable to load your cart.");
    } finally {
      setLoadingCart(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  // Remove product from cart
  async function removeItem(productId) {
    try {
      setMessage("");
      setRemovingItem(productId);

      await api(`/cart/${productId}`, {
        method: "DELETE",
      });

      await loadCart();
      setMessage("Product removed from your cart.");
    } catch (error) {
      setMessage(error.message || "Unable to remove this product.");
    } finally {
      setRemovingItem(null);
    }
  }

  // Place order
  async function checkout() {
    if (placingOrder) return;

    const shippingAddress = address.trim();

    if (shippingAddress.length < 8) {
      setMessage("Please enter a valid shipping address.");
      return;
    }

    if (items.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);
      setMessage("");

      const response = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          shippingAddress,
        }),
      });

      if (!response || !response.order) {
        throw new Error(
          response?.message || "Order could not be confirmed. Please check your orders."
        );
      }

      setItems([]);
      setAddress("");

      setMessage(
        `Order #${response.order.id} placed successfully!`
      );
    } catch (error) {
      setMessage(
        error.message || "Something went wrong while placing your order."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  // Authentication loading
  if (loading) {
    return (
      <main className="pageWrap">
        <p>Loading...</p>
      </main>
    );
  }

  // User must sign in
  if (!user) {
    return (
      <main className="pageWrap empty">
        <h1>Your cart is waiting</h1>
        <p>Please sign in to view your cart.</p>

        <Link className="btn btn-primary" href="/login">
          Sign in
        </Link>
      </main>
    );
  }

  // Calculate subtotal
  const total = items.reduce((sum, item) => {
    return (
      sum +
      Number(item.product?.price || 0) * Number(item.quantity || 0)
    );
  }, 0);

  return (
    <main className="pageWrap">
      <span className="eyebrow">YOUR SELECTION</span>

      <h1>Shopping cart</h1>

      {message && (
        <p className="notice" role="status" aria-live="polite">
          {message}
        </p>
      )}

      {loadingCart ? (
        <div className="empty">
          <p>Loading your cart...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <h3>Your cart is empty</h3>

          <p>
            Discover our collection and add your favorite products.
          </p>

          <Link href="/" className="btn btn-primary">
            Explore products
          </Link>
        </div>
      ) : (
        <div className="cartLayout">
          {/* Cart products */}
          <div className="cartItems">
            {items.map((item) => (
              <div className="cartRow" key={item.id}>
                <img
                  src={item.product?.imageUrl || "/placeholder.png"}
                  alt={item.product?.name || "Product"}
                />

                <div className="cartProduct">
                  <b>{item.product?.name || "Product"}</b>

                  <small>
                    Qty: {item.quantity}
                  </small>
                </div>

                <b>
                  {money(
                    Number(item.product?.price || 0) *
                      Number(item.quantity || 0)
                  )}
                </b>

                <button
                  type="button"
                  className="removeBtn"
                  disabled={removingItem === item.productId}
                  onClick={() => removeItem(item.productId)}
                >
                  {removingItem === item.productId
                    ? "Removing..."
                    : "Remove"}
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <aside className="summary">
            <h3>Order summary</h3>

            <div className="summaryLine">
              <span>Subtotal</span>
              <b>{money(total)}</b>
            </div>

            <div className="summaryLine">
              <span>Shipping</span>
              <span>Calculated later</span>
            </div>

            <label htmlFor="shippingAddress">
              Shipping address

              <textarea
                id="shippingAddress"
                rows="4"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value);
                  setMessage("");
                }}
                placeholder="Enter your full delivery address"
                required
              />
            </label>

            <div className="summaryTotal">
              <span>Total</span>
              <b>{money(total)}</b>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-full"
              disabled={
                placingOrder ||
                address.trim().length < 8 ||
                items.length === 0
              }
              onClick={checkout}
            >
              {placingOrder ? "Placing order..." : "Place order"}
            </button>

            <p className="muted">
              Please check your delivery address before placing your order.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
