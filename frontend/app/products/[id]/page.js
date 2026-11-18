"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, money } from "../../../lib/api";
import { useAuth } from "../../../components/AuthProvider";
export default function ProductDetails() {
  const { id } = useParams(),
    router = useRouter(),
    { user } = useAuth();
  const [product, setProduct] = useState(null),
    [qty, setQty] = useState(1),
    [message, setMessage] = useState("");
  useEffect(() => {
    api(`/products/${id}`)
      .then((r) => setProduct(r.product))
      .catch((e) => setMessage(e.message));
  }, [id]);
  async function add() {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      await api("/cart", {
        method: "POST",
        body: JSON.stringify({ productId: id, quantity: Number(qty) }),
      });
      setMessage("Added to cart successfully.");
    } catch (e) {
      setMessage(e.message);
    }
  }
  if (!product)
    return <main className="pageWrap">{message || "Loading product..."}</main>;
  return (
    <main className="pageWrap">
      <Link href="/" className="backLink">
        ← Back to collection
      </Link>
      <div className="detailGrid">
        <img
          className="detailImage"
          src={
            product.imageUrl ||
            "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85"
          }
          alt={product.name}
        />
        <div className="detailCopy">
          <span className="eyebrow">{product.category?.name}</span>
          <h1>{product.name}</h1>
          <div className="detailPrice">{money(product.price)}</div>
          <p>{product.description}</p>
          <p className="stockText">
            {product.stock > 0
              ? `${product.stock} available`
              : "Currently out of stock"}
          </p>
          <label className="qtyLabel">
            Quantity
            <input
              type="number"
              min="1"
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </label>
          <button
            className="btn btn-primary btn-lg"
            disabled={!product.stock}
            onClick={add}
          >
            Add to cart
          </button>
          {message && <p className="notice">{message}</p>}
        </div>
      </div>
    </main>
  );
}
