import { useMemo } from "react";
import "./Cart.css";

function Cart({ cart, onCartChange, onContinueShopping, onCheckout }) {
  const updateQuantity = (id, change) => {
    const updated = cart
      .map((item) => {
        if (item.id !== id) return item;

        const nextQuantity = item.quantity + change;

        if (nextQuantity <= 0) return null;

        return {
          ...item,
          quantity: Math.min(nextQuantity, Number(item.stock) || nextQuantity)
        };
      })
      .filter(Boolean);

    localStorage.setItem("cart", JSON.stringify(updated));
    onCartChange(updated);
  };

  const removeItem = (id) => {
    const updated = cart.filter((item) => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(updated));
    onCartChange(updated);
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let discount = 0;

    cart.forEach((item) => {
      const price = Number(item.price) || 0;
      const itemDiscount = Number(item.discount) || 0;
      const quantity = Number(item.quantity) || 0;

      subtotal += price * quantity;
      discount += (price * itemDiscount / 100) * quantity;
    });

    return {
      subtotal,
      discount,
      total: subtotal - discount
    };
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products from the Shop to continue.</p>
          <button onClick={onContinueShopping}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="cart-label">SHOPPING CART</p>
          <h2>Your Cart</h2>
          <span>
            {cart.reduce((sum, item) => sum + item.quantity, 0)} item(s) in your cart
          </span>
        </div>

        <button
          className="continue-shopping"
          onClick={onContinueShopping}
        >
          ← Continue Shopping
        </button>
      </div>

      <div className="cart-layout">
        <section className="cart-items">
          {cart.map((item) => {
            const price = Number(item.price) || 0;
            const discount = Number(item.discount) || 0;
            const finalPrice = price - (price * discount / 100);
            const itemTotal = finalPrice * item.quantity;

            return (
              <article className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <span>📦</span>
                  )}
                </div>

                <div className="cart-item-info">
                  <p>{item.category_name || "Product"}</p>
                  <h3>{item.name}</h3>

                  <div className="cart-price">
                    {discount > 0 && (
                      <span className="cart-old-price">
                        ₹{price.toFixed(2)}
                      </span>
                    )}
                    <strong>₹{finalPrice.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.id, -1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={item.quantity >= Number(item.stock)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  <strong>₹{itemTotal.toFixed(2)}</strong>
                  <button onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="cart-summary">
          <p className="summary-label">ORDER SUMMARY</p>
          <h3>Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>₹{totals.subtotal.toFixed(2)}</strong>
          </div>

          <div className="summary-row discount-row">
            <span>Discount</span>
            <strong>- ₹{totals.discount.toFixed(2)}</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{totals.total.toFixed(2)}</strong>
          </div>

          <button
            className="checkout-button"
            onClick={() => onCheckout(totals)}
          >
            Proceed to Checkout →
          </button>

          <p className="secure-note">
            🔒 Secure checkout
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
