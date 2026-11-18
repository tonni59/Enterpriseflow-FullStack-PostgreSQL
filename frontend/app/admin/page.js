"use client";
import { useEffect, useState } from "react";
import { api, money } from "../../lib/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
} from "lucide-react";
export default function AdminDashboard() {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    api("/admin/stats")
      .then((r) => setData(r.stats))
      .catch((e) => setError(e.message));
  }, []);
  if (error)
    return (
      <div className="adminContent">
        <p className="error">{error}</p>
      </div>
    );
  if (!data) return <div className="adminContent">Loading dashboard...</div>;
  const cards = [
    ["Total revenue", money(data.revenue), DollarSign],
    ["Orders", data.orders, ShoppingCart],
    ["Active products", data.products, Package],
    ["Customers", data.users, Users],
  ];
  return (
    <div className="adminContent">
      <div className="adminTitle">
        <div>
          <h1>Overview</h1>
          <p>Here is what's happening with your store today.</p>
        </div>
      </div>
      <div className="statGrid">
        {cards.map(([label, value, Icon]) => (
          <div className="statCard" key={label}>
            <div className="statIcon">
              <Icon size={19} />
            </div>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="adminPanels">
        <section className="panel">
          <h3>Revenue overview</h3>
          <p>Recent order activity</p>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.sales}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5b55d9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#5b55d9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v) => money(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#5b55d9"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel">
          <h3>
            <AlertTriangle size={17} /> Low stock alerts
          </h3>
          {data.lowStock.length ? (
            data.lowStock.map((p) => (
              <div className="miniRow" key={p.id}>
                <span>{p.name}</span>
                <b>{p.stock} left</b>
              </div>
            ))
          ) : (
            <p>All products have healthy stock levels.</p>
          )}
        </section>
      </div>
      <section className="panel">
        <h3>Recent orders</h3>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.user.name}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{o.items.length}</td>
                  <td>{money(o.total)}</td>
                  <td>
                    <span className={`status ${o.status.toLowerCase()}`}>
                      {o.status}
                    </span>
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
