"use client";
import Link from "next/link";
import { useAuth } from "../../components/AuthProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
} from "lucide-react";
export default function AdminLayout({ children }) {
  const { user, loading } = useAuth(),
    router = useRouter();
  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) router.replace("/login");
  }, [user, loading, router]);
  if (loading || !user || user.role !== "ADMIN")
    return <main className="pageWrap">Checking administrator access...</main>;
  return (
    <div className="adminShell">
      <aside className="adminSide">
        <Link href="/" className="brand">
          enterprise<span>flow</span>
        </Link>
        <small>WORKSPACE</small>
        <Link href="/admin">
          <LayoutDashboard size={17} /> Overview
        </Link>
        <Link href="/admin/products">
          <Package size={17} /> Products
        </Link>
        <Link href="/admin/orders">
          <ShoppingCart size={17} /> Orders
        </Link>
        <Link href="/admin/customers">
          <Users size={17} /> Customers
        </Link>
        <Link href="/">
          <Store size={17} /> View storefront
        </Link>
      </aside>
      <section className="adminMain">
        <div className="adminTop">
          <div>
            <span className="eyebrow">ADMINISTRATION</span>
            <b>Management console</b>
          </div>
          <span>{user.name} · Admin</span>
        </div>
        {children}
      </section>
    </div>
  );
}
