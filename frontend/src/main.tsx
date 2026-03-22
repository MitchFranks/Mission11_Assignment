// ============================================================
// main.tsx - Application Entry Point
// ============================================================
// This is the very first file that runs when the React app starts.
// It sets up three important "wrapper" components around the app:
//
// 1. StrictMode - A React development tool that warns about potential
//    problems in your code (only active during development, not production).
//
// 2. BrowserRouter - From React Router, this enables page navigation
//    (e.g., switching between "/" for books and "/cart" for the cart)
//    without the browser doing a full page reload.
//
// 3. CartProvider - Our custom context provider that makes the shopping
//    cart data available to every component in the app. Without this
//    wrapper, components couldn't access the cart.
//
// The order matters: BrowserRouter must be outside so routing works
// everywhere, and CartProvider must be outside so both pages can
// access the same cart data.
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Import Bootstrap CSS - this single import applies Bootstrap styling
// to every component in the app (tables, buttons, grid, navbar, etc.)
import 'bootstrap/dist/css/bootstrap.min.css';

import { CartProvider } from './context/CartContext.tsx';
import App from './App.tsx';

// Find the <div id="root"> element in index.html and render our React app inside it.
// The nesting order: BrowserRouter > CartProvider > App
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);
