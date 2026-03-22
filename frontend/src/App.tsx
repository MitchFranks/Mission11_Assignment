// ============================================================
// App.tsx - Root Application Component with Routing
// ============================================================
// This is the main layout component for the entire application.
// It sets up:
//   1. A navigation header that appears on every page
//   2. A cart summary that shows item count and total price
//   3. React Router routes to switch between the book list and cart
//
// React Router works by looking at the current URL and rendering
// the matching component. For example:
//   - "/" (home) renders the BookList component
//   - "/cart" renders the CartPage component
//
// BOOTSTRAP FEATURES USED:
//   1. Bootstrap Grid system (container, row, col-*) for responsive layout
//   2. Bootstrap Navbar component (new - not covered in class videos)
//   3. Bootstrap Card component with shadow (new - not covered in class)
// ============================================================

import { Routes, Route } from 'react-router-dom';
import BookList from './components/BookList';
import CartPage from './components/CartPage';
import CartSummary from './components/CartSummary';

function App() {
  return (
    <div>
      {/* ============================================================
          NAVIGATION BAR - Bootstrap Navbar component
          This is one of the TWO new Bootstrap features not covered in class.
          It provides a consistent header across all pages with the site name
          and a link to the cart. Uses Bootstrap's "navbar" classes.
          ============================================================ */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          {/* Site brand/logo - clicking it goes to the home page */}
          <a className="navbar-brand fw-bold" href="/">
            📚 Online Bookstore
          </a>

          {/* Cart link in the navbar */}
          <a className="btn btn-outline-light btn-sm" href="/cart">
            🛒 Cart
          </a>
        </div>
      </nav>

      {/* ============================================================
          MAIN CONTENT AREA - Uses Bootstrap's container for centered layout
          and Grid system (row/col) for responsive columns.
          ============================================================ */}
      <div className="container">
        {/* Bootstrap Grid: row with columns.
            On medium+ screens, the cart summary takes up 4 columns on the right.
            On small screens, everything stacks vertically. */}
        <div className="row">
          {/* Main content area - takes 8 out of 12 columns on medium+ screens */}
          <div className="col-md-8 col-lg-9">
            {/* Page header */}
            <div className="text-center mb-4">
              <h1 className="display-4">Online Bookstore</h1>
              <p className="lead text-muted">
                Browse our collection of books
              </p>
              <hr />
            </div>

            {/* Routes: React Router renders the correct component based on the URL.
                "/" shows the book list, "/cart" shows the full cart page. */}
            <Routes>
              <Route path="/" element={<BookList />} />
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </div>

          {/* Sidebar - takes 4 out of 12 columns on medium+ screens.
              Shows the cart summary so it's always visible while browsing. */}
          <div className="col-md-4 col-lg-3">
            <div className="sticky-top" style={{ top: '1rem' }}>
              <h5 className="fw-bold mb-3">Cart Summary</h5>
              {/* CartSummary component shows total items and total price.
                  This is the "cart summary on home page" required by the rubric. */}
              <CartSummary />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          FOOTER - Simple footer using Bootstrap text utilities
          ============================================================ */}
      <footer className="text-center text-muted py-4 mt-5 border-top">
        <small>© 2026 Online Bookstore — IS 413 Mission 12</small>
      </footer>
    </div>
  );
}

export default App;
