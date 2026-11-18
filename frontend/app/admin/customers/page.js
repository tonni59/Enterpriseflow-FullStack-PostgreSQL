"use client";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
export default function Customers() {
  const [users, setUsers] = useState([]),
    [error, setError] = useState("");
  useEffect(() => {
    api("/admin/users")
      .then((r) => setUsers(r.users))
      .catch((e) => setError(e.message));
  }, []);
  return (
    <div className="adminContent">
      <div className="adminTitle">
        <div>
          <h1>Customers</h1>
          <p>Customer accounts and order activity.</p>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
      <section className="panel">
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>{u._count.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
