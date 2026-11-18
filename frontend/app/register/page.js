"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../components/AuthProvider";
export default function Register() {
  const { register } = useAuth(),
    router = useRouter();
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(name, email, password);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="authPage">
      <form className="authCard" onSubmit={submit}>
        <span className="eyebrow">GET STARTED</span>
        <h1>Create your account</h1>
        <p>Join the workspace built around better work.</p>
        {error && <div className="error">{error}</div>}
        <label>
          Full name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </label>
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
            minLength="8"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </label>
        <button className="btn btn-primary btn-full" disabled={busy}>
          {busy ? "Creating..." : "Create account"}
        </button>
        <small>
          Already registered? <Link href="/login">Sign in</Link>
        </small>
      </form>
    </main>
  );
}
