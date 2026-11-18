"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Headphones } from "lucide-react";
import { api, money } from "../lib/api";
export default function Home() {
  const [products, setProducts] = useState([]),
    [categories, setCategories] = useState([]),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const load = () =>
    api(
      `/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`,
    )
      .then((r) => setProducts(r.products))
      .catch((e) => setMessage(e.message));
  useEffect(() => {
    load();
    api("/categories")
      .then((r) => setCategories(r.categories))
      .catch(() => {});
  }, [search, category]);
  return (
    <main>
      <section className="hero">
        <div className="heroCopy">
          <span className="eyebrow">THE SMARTER WAY TO WORK</span>
          <h1>
            Everything your business needs. <em>In one flow.</em>
          </h1>
          <p>
            Discover thoughtful tools for better workspaces, smarter teams and
            everyday productivity.
          </p>
          <div className="heroActions">
            <a className="btn btn-primary btn-lg" href="#products">
              Explore collection <ArrowRight size={17} />
            </a>
            <Link className="textLink" href="/register">
              Create your account
            </Link>
          </div>
          <div className="heroProof">
            <span>
              <ShieldCheck size={16} /> Secure checkout
            </span>
            <span>
              <Truck size={16} /> Order tracking
            </span>
            <span>
              <Headphones size={16} /> Customer care
            </span>
          </div>
        </div>
        <div className="heroVisual">
          <div className="heroOrb"></div>
          <img
            src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85"
            alt="Modern workspace"
          />
          <div className="floatingCard">
            <b>Built for better work</b>
            <small>Tools that move your business forward.</small>
          </div>
        </div>
      </section>
      <section className="trustStrip">
        <span>DESIGNED FOR MODERN TEAMS</span>
        <b>PRODUCTIVITY</b>
        <b>SIMPLICITY</b>
        <b>RELIABILITY</b>
        <b>GROWTH</b>
      </section>
      <section id="products" className="section">
        <div className="sectionTop">
          <div>
            <span className="eyebrow">OUR COLLECTION</span>
            <h2>Find your next essential.</h2>
            <p>Practical products, carefully selected for the way you work.</p>
          </div>
          <div className="searchBox">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
            />
          </div>
        </div>
        <div className="filters">
          <button
            className={!category ? "filter active" : "filter"}
            onClick={() => setCategory("")}
          >
            All products
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={category === c.slug ? "filter active" : "filter"}
              onClick={() => setCategory(c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
        {message && <p className="notice">{message}</p>}
        <div className="productGrid">
          {products.map((p) => (
            <Link href={`/products/${p.id}`} className="productCard" key={p.id}>
              <div className="productImage">
                <img
                  src={
                    p.imageUrl ||
                    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80"
                  }
                  alt={p.name}
                />
                <span>{p.category?.name}</span>
              </div>
              <div className="productInfo">
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                </div>
                <div className="productBottom">
                  <b>{money(p.price)}</b>
                  <span>
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {!products.length && !message && (
          <div className="empty">
            <h3>No products found</h3>
            <p>Try another search or category.</p>
          </div>
        )}
      </section>
      <section className="bottomBanner">
        <div>
          <span className="eyebrow">READY WHEN YOU ARE</span>
          <h2>Make your next move a smarter one.</h2>
          <p>
            Create an account to save your cart and keep track of every order.
          </p>
        </div>
        <Link className="btn btn-primary btn-lg" href="/register">
          Join EnterpriseFlow <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
