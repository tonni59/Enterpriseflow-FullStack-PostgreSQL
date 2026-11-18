"use client";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { ShoppingBag, Boxes } from "lucide-react";
export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="header">
      <Link className="brand" href="/">
        <span className="brandMark">
          <Boxes size={20} />
        </span>{" "}
        enterprise<span>flow</span>
      </Link>
      <nav>
        <Link href="/#products">Products</Link>
        <Link href="/orders">My orders</Link>
      </nav>
      <div className="headerActions">
        <Link className="iconLink" href="/cart">
          <ShoppingBag size={18} /> Cart
        </Link>
        {user ? (
          <>
            <span className="userHello">Hi, {user.name.split(" ")[0]}</span>
            {user.role === "ADMIN" && (
              <Link className="btn btn-light" href="/admin">
                Admin
              </Link>
            )}
            <button className="btn btn-dark" onClick={logout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Sign in</Link>
            <Link className="btn btn-primary" href="/register">
              Get started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
