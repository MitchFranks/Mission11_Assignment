// ============================================================
// CartContext.tsx - Shopping Cart State Management
// ============================================================
// This file uses React Context to create a "global" shopping cart
// that persists as the user navigates between different pages.
//
// HOW REACT CONTEXT WORKS:
// Normally, data in React flows from parent to child via "props."
// But if many components need access to the same data (like a cart),
// passing props through every level gets messy. Context lets us
// create a shared data store that ANY component can access directly.
//
// We wrap the entire app in <CartProvider>, and then any component
// can call useCart() to read or modify the cart.
// ============================================================

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Book, CartItem } from '../types/Book';

// Define what functions and data the cart context will provide.
// Any component that calls useCart() will have access to all of these.
interface CartContextType {
  cartItems: CartItem[];                // The array of items currently in the cart
  addToCart: (book: Book) => void;      // Function to add a book (or increase its quantity)
  removeFromCart: (bookID: number) => void; // Function to remove a book entirely
  updateQuantity: (bookID: number, quantity: number) => void; // Change quantity of a specific book
  clearCart: () => void;                // Empty the entire cart
  getTotalItems: () => number;          // Get the total number of items (sum of all quantities)
  getTotalPrice: () => number;          // Get the grand total price of everything in the cart
}

// Create the context object. It starts as "undefined" because we haven't
// provided any value yet -- that happens in CartProvider below.
const CartContext = createContext<CartContextType | undefined>(undefined);

// CartProvider is a wrapper component that holds the cart state.
// We place it near the top of our component tree (in main.tsx) so that
// every page and component inside it can access the cart.
export function CartProvider({ children }: { children: ReactNode }) {
  // This state array holds all the items in the shopping cart.
  // useState keeps this data alive as long as the app is running (session persistence).
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // addToCart: Called when the user clicks "Add to Cart" on a book.
  // If the book is already in the cart, we increase its quantity by 1.
  // If it's a new book, we add it to the cart with quantity = 1.
  const addToCart = (book: Book) => {
    setCartItems((prevItems) => {
      // Check if this book already exists in the cart by comparing bookID
      const existingItem = prevItems.find(
        (item) => item.book.bookID === book.bookID
      );

      if (existingItem) {
        // Book is already in cart -- create a new array where that book's
        // quantity is increased by 1. We use .map() to create a new array
        // (React requires new arrays to detect changes and re-render).
        return prevItems.map((item) =>
          item.book.bookID === book.bookID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Book is not in cart yet -- add it as a new entry with quantity 1.
        // The spread operator (...prevItems) copies all existing items,
        // then we append the new one at the end.
        return [...prevItems, { book, quantity: 1 }];
      }
    });
  };

  // removeFromCart: Removes a book entirely from the cart (regardless of quantity).
  // Uses .filter() to create a new array that excludes the specified book.
  const removeFromCart = (bookID: number) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.book.bookID !== bookID)
    );
  };

  // updateQuantity: Sets a specific book's quantity to an exact number.
  // If the new quantity is 0 or less, we remove the item entirely.
  const updateQuantity = (bookID: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookID);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.book.bookID === bookID ? { ...item, quantity } : item
      )
    );
  };

  // clearCart: Resets the cart to an empty array.
  const clearCart = () => {
    setCartItems([]);
  };

  // getTotalItems: Adds up all the quantities across every item in the cart.
  // For example, if you have 2 copies of Book A and 3 copies of Book B, this returns 5.
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // getTotalPrice: Calculates the grand total cost of everything in the cart.
  // Multiplies each book's price by its quantity and sums them all up.
  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.book.price * item.quantity,
      0
    );
  };

  // The Provider component makes all the cart data and functions available
  // to any child component that calls useCart().
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// useCart: A custom hook that components call to access the cart.
// Example usage: const { addToCart, cartItems } = useCart();
// It throws an error if used outside of a CartProvider (safety check).
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
