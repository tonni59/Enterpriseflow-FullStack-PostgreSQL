"use client";
import { useEffect, useState } from "react";
import { api, money } from "../../../lib/api";
export default function AdminOrders() {
  const [orders, setOrders] = useState([]),
    [error, setError] = useState("");
  async function load() {
    const r = await api("/admin/orders");
    setOrders(r.orders);
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);
  async function update(id, status) {
    try {
      await api(`/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <div className="adminContent">
      <div className="adminTitle">
        <div>
          <h1>Orders</h1>
          <p>Review customer orders and update fulfilment status.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <section className="panel">
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id.slice(-8)}</td>
                  <td>
                    {o.user.name}
                    <small className="tableSub">{o.user.email}</small>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{money(o.total)}</td>
                  <td>
                    <span className={`status ${o.status.toLowerCase()}`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => update(o.id, e.target.value)}
                    >
                      {[
                        "PENDING",
                        "PROCESSING",
                        "SHIPPED",
                        "DELIVERED",
                        "CANCELLED",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
