import { useEffect, useMemo, useState } from "react";
import "./Shop.css";

const API_URL = "http://localhost:5000/api";

function Shop({ token, onCartChange }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [addingProduct, setAddingProduct] = useState(null);

  const loadCart = async () => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load cart");
      }

      const items = data.cart?.items || [];

      localStorage.setItem("cart", JSON.stringify(items));

      if (onCartChange) {
        onCartChange(items);
      }

      return items;
    } catch (error) {
      console.error("Load cart error:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load products"
          );
        }

        setProducts(data.products || []);
      } catch (error) {
        console.error(error);
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    if (token) {
      loadCart();
    }
  }, [token]);

  const categories = useMemo(() => {
    return [
      ...new Map(
        products
          .filter((product) => product.category_id)
          .map((product) => [
            product.category_id,
            {
              id: product.category_id,
              name: product.category_name
            }
          ])
      ).values()
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.name || ""} ${
        product.description || ""
      }`.toLowerCase();

      const matchesSearch = text.includes(
        search.toLowerCase()
      );

      const matchesCategory =
        category === "all" ||
        String(product.category_id) === String(category);

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const addToCart = async (product) => {
    if (!token) {
      setMessage(
        "Please login before adding products to your cart."
      );
      return;
    }

    if (Number(product.stock) <= 0) {
      setMessage("This product is out of stock.");
      return;
    }

    try {
      setAddingProduct(product.id);
      setMessage("");

      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to add product to cart"
        );
      }

      await loadCart();

      setMessage(
        `${product.name} added to your cart.`
      );
    } catch (error) {
      console.error("Add cart error:", error);
      setMessage(error.message);
    } finally {
      setAddingProduct(null);
    }
  };

  return (
    <div className="shop-page">
      <header className="shop-header">
        <div>
          <p className="shop-label">
            ENTERPRISE STORE
          </p>

          <h1>Find Products You Love</h1>

          <p>
            Browse products and add your favourites to your
            cart.
          </p>
        </div>

        <div className="shop-cart-badge">
          🛒 Shopping Cart
        </div>
      </header>

      {message && (
        <div className="shop-message">
          <span>{message}</span>

          <button
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}

      <section className="shop-toolbar">
        <div>
          <label>Search Products</label>

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search products..."
          />
        </div>

        <div>
          <label>Category</label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="all">
              All Categories
            </option>

            {categories.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="shop-state">
          <div className="shop-spinner" />
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="shop-state">
          <div className="shop-empty-icon">
            📦
          </div>

          <h2>No products found</h2>

          <p>
            Try another search or category.
          </p>
        </div>
      ) : (
        <section className="product-grid">
          {filteredProducts.map((product) => {
            const price = Number(product.price);
            const discount = Number(
              product.discount || 0
            );

            const finalPrice =
              price -
              (price * discount) / 100;

            const outOfStock =
              Number(product.stock) <= 0;

            return (
              <article
                className="product-card"
                key={product.id}
              >
                <div className="product-image">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      📦
                    </div>
                  )}

                  {discount > 0 && (
                    <span className="discount-badge">
                      {discount}% OFF
                    </span>
                  )}

                  {outOfStock && (
                    <span className="stock-badge">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="product-content">
                  <p className="product-category">
                    {product.category_name ||
                      "General"}
                  </p>

                  <h2>{product.name}</h2>

                  <p className="product-description">
                    {product.description ||
                      "Quality product from Enterprise Store."}
                  </p>

                  <div className="product-price">
                    {discount > 0 && (
                      <span className="old-price">
                        ₹{price.toFixed(2)}
                      </span>
                    )}

                    <strong>
                      ₹{finalPrice.toFixed(2)}
                    </strong>
                  </div>

                  <p className="product-stock">
                    {outOfStock
                      ? "Currently unavailable"
                      : `${product.stock} items available`}
                  </p>

                  <button
                    className="add-cart-button"
                    disabled={
                      outOfStock ||
                      addingProduct === product.id
                    }
                    onClick={() =>
                      addToCart(product)
                    }
                  >
                    {addingProduct === product.id
                      ? "Adding..."
                      : outOfStock
                      ? "Out of Stock"
                      : "🛒 Add to Cart"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default Shop;