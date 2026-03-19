// TypeScript interface representing a Book object from the API.
// These fields match the columns in the SQLite "Books" table.
export interface Book {
  bookID: number;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: number;
  price: number;
}

// Shape of the paginated response returned by the API
export interface PaginatedBooksResponse {
  books: Book[];
  totalBooks: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
