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

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Book, CartItem } from '../types/Book';

// This is the key we use to store the cart in the browser's localStorage.
// localStorage is like a small database built into every browser -- data
// saved here survives page refreshes and even closing/reopening the browser.
const CART_STORAGE_KEY = 'bookstore-cart';

// Helper function: Load saved cart data from localStorage.
// If nothing is saved yet (first visit), return an empty array.
// We wrap this in a try/catch because localStorage can sometimes fail
// (e.g., if the browser is in private mode with storage disabled).
function loadCartFromStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as CartItem[];
    }
  } catch {
    // If parsing fails for any reason, start with an empty cart
  }
  return [];
}

// Helper function: Save the current cart to localStorage.
// JSON.stringify converts our JavaScript array into a text string
// because localStorage can only store text, not objects.
function saveCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // If storage is full or unavailable, silently fail
  }
}

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
  // We initialize it by loading any previously saved cart from localStorage.
  // This means the cart survives page refreshes -- if the user had items in
  // their cart and refreshes the page, the items will still be there.
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCartFromStorage);

  // useEffect: Every time cartItems changes (add, remove, update quantity),
  // automatically save the updated cart to localStorage so it persists.
  // The [cartItems] dependency array means this runs after every cart change.
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

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

  // clearCart: Resets the cart to an empty array and removes saved data.
  // The useEffect above will also save the empty array to localStorage,
  // but we explicitly remove it here for a clean slate.
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
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
