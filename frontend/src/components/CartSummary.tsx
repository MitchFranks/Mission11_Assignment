// ============================================================
// CartSummary.tsx - Mini Cart Display for the Navigation Bar
// ============================================================
// This small component shows a summary of the cart at the top of
// every page. It displays:
//   - The total number of items in the cart (quantity)
//   - The total price of all items
//   - A clickable link that navigates to the full cart page
//
// It reads from CartContext so it automatically updates whenever
// a book is added or removed from the cart, no matter what page
// the user is on.
// ============================================================

import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';

function CartSummary() {
  // Access cart data from the global context
  const { getTotalItems, getTotalPrice } = useCart();

  // useNavigate to go to the cart page when clicked
  const navigate = useNavigate();

  // useLocation to save the current URL so "Continue Shopping"
  // in the cart page can return the user to this exact spot.
  const location = useLocation();

  // Get the current item count and total price
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // When the user clicks the cart summary, navigate to the cart page
  // and pass the current URL as state so we can return to it later.
  const goToCart = () => {
    navigate('/cart', {
      state: { returnTo: location.pathname + location.search },
    });
  };

  return (
    // Bootstrap "card" with a click handler to go to the cart page.
    // Uses "bg-light" for a subtle background and "shadow-sm" for a small shadow.
    <div
      className="card bg-light shadow-sm mb-3"
      style={{ cursor: 'pointer' }}
      onClick={goToCart}
      role="button"
      aria-label="View shopping cart"
    >
      <div className="card-body py-2 px-3">
        <div className="d-flex justify-content-between align-items-center">
          {/* Cart icon and item count */}
          <span className="fw-bold">
            🛒 Cart: {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>

          {/* Total price, displayed in green if there are items */}
          <span className={`fw-bold ${totalItems > 0 ? 'text-success' : 'text-muted'}`}>
            ${totalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CartSummary;
