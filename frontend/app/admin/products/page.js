
"use client";

import { useEffect, useState } from "react";
import { api, money } from "../../../lib/api";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });

  async function load() {
    const [p, c] = await Promise.all([
      api("/products?limit=100"),
      api("/categories"),
    ]);

    setProducts(p.products || []);
    setCategories(c.categories || []);

    if (!form.categoryId && c.categories?.[0]) {
      setForm((f) => ({
        ...f,
        categoryId: c.categories[0].id,
      }));
    }
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(imageFile);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [imageFile]);

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      setImageFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      setImageFile(null);
      return;
    }

    setError("");
    setSuccess("");
    setImageFile(file);
  }

  async function create(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!imageFile) {
      setError("Please select a product image.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload image from computer
      const imageData = new FormData();
      imageData.append("image", imageFile);

      const uploaded = await api("/uploads", {
        method: "POST",
        body: imageData,
      });

      if (!uploaded.url) {
        throw new Error("Image upload failed.");
      }

      // 2. Create product using uploaded image URL
      await api("/products", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          imageUrl: uploaded.url,
        }),
      });

      // 3. Reset form
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: categories[0]?.id || "",
      });

      setImageFile(null);

      const fileInput = document.getElementById("productImage");
      if (fileInput) fileInput.value = "";

      // 4. Refresh product catalogue
      await load();

      setSuccess("Product created successfully!");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function archive(id) {
    if (!confirm("Archive this product?")) return;

    setError("");
    setSuccess("");

    try {
      await api(`/products/${id}`, {
        method: "DELETE",
      });

      await load();
      setSuccess("Product archived successfully.");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="adminContent">
      <div className="adminTitle">
        <div>
          <h1>Products</h1>
          <p>Create and manage your product catalogue.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <section className="panel">
        <h3>Add a product</h3>

        <form className="adminForm" onSubmit={create}>
          <input
            required
            placeholder="Product name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            required
            placeholder="Price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          <input
            required
            placeholder="Stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) =>
              setForm({ ...form, stock: e.target.value })
            }
          />

          <select
            required
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value })
            }
          >
            <option value="">Select category</option>

            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="wideInput">
            <label
              htmlFor="productImage"
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: 600,
              }}
            >
              Product Image
            </label>

            <input
              id="productImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={handleImageChange}
            />

            <small style={{ display: "block", marginTop: "8px" }}>
              JPG, PNG or WebP. Maximum file size: 5 MB.
            </small>

            {preview && (
              <div style={{ marginTop: "16px" }}>
                <p style={{ marginBottom: "8px" }}>
                  Image preview
                </p>

                <img
                  src={preview}
                  alt="Product preview"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                  }}
                />

                <button
                  type="button"
                  className="removeBtn"
                  style={{ display: "block", marginTop: "10px" }}
                  onClick={() => {
                    setImageFile(null);
                    setError("");

                    const input =
                      document.getElementById("productImage");

                    if (input) input.value = "";
                  }}
                >
                  Remove image
                </button>
              </div>
            )}
          </div>

          <textarea
            required
            className="wideInput"
            placeholder="Product description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Uploading and creating..." : "Create product"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h3>Product catalogue ({products.length})</h3>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        style={{
                          width: "55px",
                          height: "55px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      "No image"
                    )}
                  </td>

                  <td>{p.name}</td>
                  <td>{p.category?.name}</td>
                  <td>{money(p.price)}</td>
                  <td>{p.stock}</td>

                  <td>
                    <button
                      className="removeBtn"
                      onClick={() => archive(p.id)}
                    >
                      Archive
                    </button>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan="6">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
