import { useState, useEffect } from 'react';
import type { Book, PaginatedBooksResponse } from '../types/Book';

// Base URL for the ASP.NET Core API running locally
const API_URL = 'http://localhost:5156/api/Books';

function BookList() {
  // State for the list of books returned from the current page
  const [books, setBooks] = useState<Book[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalBooks, setTotalBooks] = useState<number>(0);

  // Sorting state: null = no sort, "asc" = A-Z, "desc" = Z-A
  const [sortOrder, setSortOrder] = useState<string | null>(null);

  // Loading and error state for better UX
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch books from the API whenever page, pageSize, or sort order changes
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build the query string with pagination and optional sorting params
        let url = `${API_URL}?pageNumber=${currentPage}&pageSize=${pageSize}`;
        if (sortOrder) {
          url += `&sortByTitle=${sortOrder}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data: PaginatedBooksResponse = await response.json();

        // Update state with the returned data
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

    fetchBooks();
  }, [currentPage, pageSize, sortOrder]);

  // Handler for changing the number of results per page.
  // Resets to page 1 whenever the page size is changed.
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Toggle sort order: unsorted -> asc -> desc -> unsorted
  const handleSortToggle = () => {
    if (sortOrder === null) {
      setSortOrder('asc');
    } else if (sortOrder === 'asc') {
      setSortOrder('desc');
    } else {
      setSortOrder(null);
    }
    // Reset to first page when sort changes
    setCurrentPage(1);
  };

  // Helper to render a sort indicator icon next to the Title header
  const getSortIcon = () => {
    if (sortOrder === 'asc') return ' ▲';
    if (sortOrder === 'desc') return ' ▼';
    return ' ⇅';
  };

  // Show a loading spinner while fetching data
  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Display an error alert if the fetch failed
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div>
      {/* Controls row: page size selector and total count */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <label htmlFor="pageSize" className="form-label me-2 fw-bold">
            Results per page:
          </label>
          <select
            id="pageSize"
            className="form-select d-inline-block w-auto"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
          >
            {/* Generate options from 5 to 15 so user can pick any value */}
            {Array.from({ length: 11 }, (_, i) => i + 5).map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <span className="text-muted">
          Showing {books.length} of {totalBooks} books
        </span>
      </div>

      {/* Books table styled with Bootstrap */}
      <table className="table table-striped table-hover table-bordered">
        <thead className="table-dark">
          <tr>
            {/* Title column header is clickable to toggle sorting */}
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
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.bookID}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.publisher}</td>
              <td>{book.isbn}</td>
              <td>{book.classification}</td>
              <td>{book.category}</td>
              <td>{book.pageCount}</td>
              {/* Format price as US currency */}
              <td>${book.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Dynamic pagination controls built from totalPages */}
      <nav aria-label="Book pagination">
        <ul className="pagination justify-content-center">
          {/* Previous page button, disabled on the first page */}
          <li
            className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>

          {/* Dynamically generate a page link for each page number */}
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

          {/* Next page button, disabled on the last page */}
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
    </div>
  );
}

export default BookList;
