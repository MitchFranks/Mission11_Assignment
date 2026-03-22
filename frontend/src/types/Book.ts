// ============================================================
// Book.ts - TypeScript type definitions for the bookstore app
// ============================================================
// These interfaces define the "shape" of our data objects.
// TypeScript uses these to catch errors at compile time --
// for example, if you accidentally try to use book.titel
// instead of book.title, TypeScript will flag it immediately.
// ============================================================

// Represents a single book from the database.
// Each field here matches a column in the SQLite "Books" table exactly.
export interface Book {
  bookID: number;       // Unique ID (primary key) for each book
  title: string;        // The book's title (e.g., "Les Miserables")
  author: string;       // Who wrote the book
  publisher: string;    // The publishing company
  isbn: string;         // International Standard Book Number (unique identifier)
  classification: string; // "Fiction" or "Non-Fiction"
  category: string;     // More specific grouping like "Biography", "Self-Help", etc.
  pageCount: number;    // How many pages the book has
  price: number;        // The price in dollars (e.g., 9.95)
}

// Represents the JSON response that the API sends back when we request books.
// It includes the actual books PLUS metadata about pagination so the frontend
// knows how many page buttons to display.
export interface PaginatedBooksResponse {
  books: Book[];        // The array of books for the current page
  totalBooks: number;   // Total number of books matching the current filter
  totalPages: number;   // How many pages exist (totalBooks / pageSize, rounded up)
  currentPage: number;  // Which page we are currently viewing
  pageSize: number;     // How many books are shown per page
}

// Represents one item in the shopping cart.
// When a user adds a book, we store the book details plus a quantity counter.
export interface CartItem {
  book: Book;           // The full book object (so we can display title, price, etc.)
  quantity: number;     // How many copies of this book the user wants to buy
}
