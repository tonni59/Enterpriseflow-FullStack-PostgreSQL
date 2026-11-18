"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, money } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";
export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    if (user)
      api("/orders/my")
        .then((r) => setOrders(r.orders))
        .catch((e) => setError(e.message));
  }, [user]);
  if (!user)
    return (
      <main className="pageWrap empty">
        <h1>Sign in to view orders</h1>
        <Link href="/login" className="btn btn-primary">
          Sign in
        </Link>
      </main>
    );
  return (
    <main className="pageWrap">
      <span className="eyebrow">YOUR ACCOUNT</span>
      <h1>Order history</h1>
      {error && <p className="error">{error}</p>}
      {orders.length ? (
        orders.map((o) => (
          <article className="orderCard" key={o.id}>
            <div className="orderHead">
              <b>Order #{o.id.slice(-8)}</b>
              <span className={`status ${o.status.toLowerCase()}`}>
                {o.status}
              </span>
            </div>
            <p>
              {new Date(o.createdAt).toLocaleString()} · {o.items.length}{" "}
              item(s)
            </p>
            <div className="orderHead">
              <b>{money(o.total)}</b>
              <small>{o.shippingAddress}</small>
            </div>
          </article>
        ))
      ) : (
        <div className="empty">
          <h3>No orders yet</h3>
          <Link href="/" className="btn btn-primary">
            Browse products
          </Link>
        </div>
      )}
    </main>
  );
}
