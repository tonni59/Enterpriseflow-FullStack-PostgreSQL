"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../components/AuthProvider";
export default function Login() {
  const { login } = useAuth(),
    router = useRouter();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
      router.push(user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="authPage">
      <form className="authCard" onSubmit={submit}>
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Sign in to your account</h1>
        <p>Pick up right where you left off.</p>
        {error && <div className="error">{error}</div>}
        <label>
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />
        </label>
        <button className="btn btn-primary btn-full" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
        <small>
          New to EnterpriseFlow? <Link href="/register">Create an account</Link>
        </small>
      </form>
    </main>
  );
}
