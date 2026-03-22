// ============================================================
// CartPage.tsx - Shopping Cart Page Component
// ============================================================
// This component displays the full shopping cart. It shows:
//   - Each book the user added, with its price and quantity
//   - A subtotal for each line item (price × quantity)
//   - A grand total at the bottom
//   - Buttons to increase/decrease quantity or remove items
//   - A "Continue Shopping" button that takes the user back to
//     the exact page and filters they were on before
//
// The cart data comes from CartContext, which persists across
// page navigation (the cart doesn't reset when you switch pages).
// ============================================================

import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';

function CartPage() {
  // Pull cart data and functions from the global CartContext.
  // These let us read the cart and modify it (update quantity, remove, etc.).
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } =
    useCart();

  // useNavigate lets us send the user to another page programmatically.
  const navigate = useNavigate();

  // useLocation gives us access to the current URL and any state that was
  // passed when navigating here. We don't use state directly, but we read
  // the "from" search params that were saved in the URL.
  const location = useLocation();

  // "Continue Shopping" sends the user back to the book list.
  // If they came from a filtered/paginated view (e.g., page 2 with category=Biography),
  // those URL parameters are preserved so they return to the same spot.
  const handleContinueShopping = () => {
    // The referrer search params are stored in the location state if available,
    // otherwise we just go to the base books page.
    const returnPath = location.state?.returnTo || '/';
    navigate(returnPath);
  };

  return (
    <div className="container mt-4">
      {/* Page title */}
      <h2 className="mb-4">
        <span className="me-2">🛒</span>Your Shopping Cart
      </h2>

      {/* ============================================================
          EMPTY CART STATE
          If no items are in the cart, show a friendly message with
          a Bootstrap "alert" component (info style = light blue).
          ============================================================ */}
      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <div className="alert alert-info" role="alert">
            <h4 className="alert-heading">Your cart is empty</h4>
            <p>Browse our collection and add some books!</p>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/')}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* ============================================================
              CART TABLE
              Shows each item with quantity controls, subtotal per line,
              and a remove button. Uses Bootstrap table styling.
              ============================================================ */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Book</th>
                  <th>Price</th>
                  <th style={{ width: '180px' }}>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.book.bookID}>
                    {/* Book title and author info */}
                    <td>
                      <div className="fw-bold">{item.book.title}</div>
                      <small className="text-muted">by {item.book.author}</small>
                    </td>

                    {/* Unit price */}
                    <td>${item.book.price.toFixed(2)}</td>

                    {/* Quantity controls using Bootstrap's "input-group" component.
                        The minus and plus buttons are grouped with the number display
                        to create a clean, connected control. */}
                    <td>
                      <div className="input-group input-group-sm">
                        {/* Decrease quantity button (minimum is 1) */}
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            updateQuantity(item.book.bookID, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>

                        {/* Display current quantity in a read-only styled span */}
                        <span className="input-group-text px-3">
                          {item.quantity}
                        </span>

                        {/* Increase quantity button */}
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            updateQuantity(item.book.bookID, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Subtotal: price × quantity for this specific book */}
                    <td className="fw-bold">
                      ${(item.book.price * item.quantity).toFixed(2)}
                    </td>

                    {/* Remove button to delete this book from the cart entirely */}
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeFromCart(item.book.bookID)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ============================================================
              CART SUMMARY - Uses Bootstrap Card component (a new feature)
              Shows the grand total and action buttons.
              The card has a subtle shadow using Bootstrap's "shadow-sm" class.
              ============================================================ */}
          <div className="row justify-content-end">
            <div className="col-md-5">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Order Summary</h5>
                  <hr />
                  {/* Show quantity and price breakdown */}
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Items:</span>
                    <span>
                      {cartItems.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="fw-bold fs-5">Grand Total:</span>
                    <span className="fw-bold fs-5 text-success">
                      ${getTotalPrice().toFixed(2)}
                    </span>
                  </div>

                  {/* Action buttons stacked vertically using Bootstrap's d-grid */}
                  <div className="d-grid gap-2">
                    <button className="btn btn-success btn-lg">
                      Checkout
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleContinueShopping}
                    >
                      ← Continue Shopping
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
