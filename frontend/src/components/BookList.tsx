// ============================================================
// BookList.tsx - Main Book Listing Component
// ============================================================
// This component is the heart of the bookstore app. It:
//   1. Fetches books from the API with pagination
//   2. Lets the user filter by category (Biography, Self-Help, etc.)
//   3. Lets the user sort by book title (A-Z or Z-A)
//   4. Lets the user change how many results appear per page
//   5. Provides an "Add to Cart" button for each book
//   6. Uses Bootstrap Grid for responsive layout
//
// The page numbers automatically adjust when a filter is applied
// (e.g., if only 3 books are in "Biography", only 1 page shows).
// ============================================================

import { useState, useEffect } from 'react';
import type { Book, PaginatedBooksResponse } from '../types/Book';
import { useCart } from '../context/CartContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';

function BookList() {
  // ---- React Router hooks ----
  // useNavigate lets us programmatically go to another page (like the cart)
  const navigate = useNavigate();
  // useSearchParams lets us read/write URL query parameters (e.g., ?page=2&category=Biography)
  // This is important because when the user clicks "Continue Shopping" from the cart,
  // we can send them back to the exact same page and filter they were on.
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- Cart context ----
  // Pull the addToCart function from our global cart context
  // so we can add books when the user clicks the "Add to Cart" button.
  const { addToCart } = useCart();

  // ---- State variables ----
  // Read initial values from URL params so "Continue Shopping" restores the user's place
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(
    Number(searchParams.get('page')) || 1
  );
  const [pageSize, setPageSize] = useState<number>(
    Number(searchParams.get('size')) || 5
  );
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalBooks, setTotalBooks] = useState<number>(0);

  // Sorting: null means no sorting applied, "asc" = A-Z, "desc" = Z-A
  const [sortOrder, setSortOrder] = useState<string | null>(
    searchParams.get('sort') || null
  );

  // Category filter: null means "show all categories"
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category') || null
  );

  // List of all available categories fetched from the API
  const [categories, setCategories] = useState<string[]>([]);

  // Loading spinner and error message state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track which book just got added to cart so we can show brief feedback
  const [addedBookId, setAddedBookId] = useState<number | null>(null);

  // ---- Fetch the list of categories when the component first loads ----
  // This runs once on mount (empty dependency array []) to get all unique
  // categories like "Biography", "Self-Help", "Classic", etc.
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/categories`);
        if (response.ok) {
          const data: string[] = await response.json();
          setCategories(data);
        }
      } catch {
        // If categories fail to load, the filter just won't appear.
        // The rest of the app still works fine.
      }
    };
    fetchCategories();
  }, []);

  // ---- Fetch books whenever page, pageSize, sort, or category changes ----
  // This useEffect watches all four dependencies. Whenever any of them change,
  // it makes a new API call with the updated parameters.
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build the URL with query parameters for pagination
        let url = `${API_URL}?pageNumber=${currentPage}&pageSize=${pageSize}`;

        // Append the sort parameter if user has chosen a sort order
        if (sortOrder) {
          url += `&sortByTitle=${sortOrder}`;
        }

        // Append the category filter if user selected a specific category
        if (selectedCategory) {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data: PaginatedBooksResponse = await response.json();

        // Store the fetched data in state so it renders on screen
        setBooks(data.books);
        setTotalPages(data.totalPages);
        setTotalBooks(data.totalBooks);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch books'
        );
      } finally {
        setLoading(false);
      }
    };

    // Keep the URL in sync with current state so the browser's address bar
    // reflects the current page/filter. This makes "Continue Shopping" work.
    const params: Record<string, string> = {};
    if (currentPage > 1) params.page = String(currentPage);
    if (pageSize !== 5) params.size = String(pageSize);
    if (sortOrder) params.sort = sortOrder;
    if (selectedCategory) params.category = selectedCategory;
    setSearchParams(params, { replace: true });

    fetchBooks();
  }, [currentPage, pageSize, sortOrder, selectedCategory]);

  // ---- Event handlers ----

  // When user changes the "Results per page" dropdown, reset to page 1
  // because the old page number might not exist with the new page size.
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // When user clicks a category filter button, apply that filter and reset to page 1.
  // If they click the already-selected category, remove the filter (show all).
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Cycle through sort states: unsorted -> ascending -> descending -> unsorted
  const handleSortToggle = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
    setCurrentPage(1);
  };

  // When user clicks "Add to Cart", add the book and show brief visual feedback
  const handleAddToCart = (book: Book) => {
    addToCart(book);
    setAddedBookId(book.bookID);
    // Clear the "Added!" feedback after 1.5 seconds
    setTimeout(() => setAddedBookId(null), 1500);
  };

  // Returns an arrow icon to show the current sort direction in the table header
  const getSortIcon = () => {
    if (sortOrder === 'asc') return ' ▲';
    if (sortOrder === 'desc') return ' ▼';
    return ' ⇅';
  };

  // ---- Render: Loading state ----
  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // ---- Render: Error state ----
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  // ---- Render: Main content ----
  return (
    <div>
      {/* ============================================================
          CATEGORY FILTER BUTTONS
          These use Bootstrap "badge" pills (a new Bootstrap feature).
          Clicking a category filters the book list; clicking again removes the filter.
          ============================================================ */}
      {categories.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold mb-2">Filter by Category:</h6>
          <div className="d-flex flex-wrap gap-2">
            {/* "All" button to remove any active filter */}
            <button
              className={`btn ${selectedCategory === null ? 'btn-primary' : 'btn-outline-primary'} btn-sm rounded-pill`}
              onClick={() => handleCategoryChange(null)}
            >
              All
            </button>
            {/* One button for each category from the database */}
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-primary'} btn-sm rounded-pill`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          CONTROLS ROW using Bootstrap Grid (row/col)
          Left side: results-per-page dropdown
          Right side: showing X of Y books text
          ============================================================ */}
      <div className="row align-items-center mb-3">
        <div className="col-md-6">
          <label htmlFor="pageSize" className="form-label me-2 fw-bold">
            Results per page:
          </label>
          <select
            id="pageSize"
            className="form-select d-inline-block w-auto"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            {/* Generate dropdown options from 5 to 15 */}
            {Array.from({ length: 11 }, (_, i) => i + 5).map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6 text-md-end mt-2 mt-md-0">
          <span className="text-muted">
            Showing {books.length} of {totalBooks} books
            {selectedCategory && (
              <span className="badge bg-info ms-2">{selectedCategory}</span>
            )}
          </span>
        </div>
      </div>

      {/* ============================================================
          BOOKS TABLE - Styled with Bootstrap's table classes
          Uses Bootstrap Grid (table-responsive) for mobile-friendly layout.
          Each row shows book info plus an "Add to Cart" button.
          ============================================================ */}
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered">
          <thead className="table-dark">
            <tr>
              {/* Title header is clickable to toggle sort order */}
              <th
                onClick={handleSortToggle}
                style={{ cursor: 'pointer' }}
                title="Click to sort by title"
              >
                Title{getSortIcon()}
              </th>
              <th>Author</th>
              <th>Publisher</th>
              <th>ISBN</th>
              <th>Classification</th>
              <th>Category</th>
              <th>Page Count</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.bookID}>
                <td className="fw-semibold">{book.title}</td>
                <td>{book.author}</td>
                <td>{book.publisher}</td>
                <td><small>{book.isbn}</small></td>
                <td>{book.classification}</td>
                <td>
                  {/* Bootstrap badge to make category stand out visually */}
                  <span className="badge bg-secondary">{book.category}</span>
                </td>
                <td>{book.pageCount}</td>
                <td>${book.price.toFixed(2)}</td>
                <td>
                  {/* "Add to Cart" button with visual feedback when clicked.
                      Uses Bootstrap's btn-success (green) for the "Added!" state
                      and btn-outline-primary (blue outline) for the default state. */}
                  <button
                    className={`btn btn-sm ${addedBookId === book.bookID ? 'btn-success' : 'btn-outline-primary'}`}
                    onClick={() => handleAddToCart(book)}
                  >
                    {addedBookId === book.bookID ? '✓ Added!' : 'Add to Cart'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================================================
          PAGINATION - Dynamically generated page buttons
          The number of buttons automatically adjusts based on how many
          books match the current filter (category + page size).
          ============================================================ */}
      <nav aria-label="Book pagination">
        <ul className="pagination justify-content-center">
          {/* "Previous" button - disabled when on page 1 */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {/* Generate one numbered button for each page.
              Array.from creates an array like [1, 2, 3, 4] from totalPages.
              The "active" class highlights the current page. */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <li
                key={pageNum}
                className={`page-item ${pageNum === currentPage ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              </li>
            )
          )}

          {/* "Next" button - disabled when on the last page */}
          <li
            className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>

      {/* ============================================================
          VIEW CART BUTTON - Fixed at the bottom of the book list
          Uses Bootstrap's "d-grid" for a full-width button on mobile.
          ============================================================ */}
      <div className="d-grid gap-2 col-md-4 mx-auto mt-3">
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/cart')}
        >
          🛒 View Cart
        </button>
      </div>
    </div>
  );
}

export default BookList;
