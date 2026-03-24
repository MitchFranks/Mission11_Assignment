// ============================================================
// AdminBooks.tsx - Admin Page for Managing Books (CRUD)
// ============================================================
// This component provides an administration interface where the user can:
//   1. VIEW all books in a table
//   2. ADD a new book using a form
//   3. EDIT an existing book (populates the form with current data)
//   4. DELETE a book (with a confirmation prompt)
//
// These operations correspond to the four basic database operations
// known as CRUD: Create, Read, Update, Delete.
//
// The component talks to the backend API:
//   - GET    /api/Books        → fetches all books (Read)
//   - POST   /api/Books        → creates a new book (Create)
//   - PUT    /api/Books/{id}   → updates an existing book (Update)
//   - DELETE /api/Books/{id}   → deletes a book (Delete)
// ============================================================

import { useState, useEffect } from 'react';
import type { Book } from '../types/Book';
import { API_URL } from '../config';

// This is the blank/default state for the book form.
// When adding a new book, the form starts with these empty values.
// When editing, these get replaced with the selected book's data.
const emptyBook: Omit<Book, 'bookID'> & { bookID: number } = {
  bookID: 0,
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  classification: '',
  category: '',
  pageCount: 0,
  price: 0,
};

function AdminBooks() {
  // ---- State variables ----

  // All books loaded from the database (for the table display)
  const [books, setBooks] = useState<Book[]>([]);

  // The form data -- holds whatever the user is typing into the add/edit form.
  // When bookID is 0, we're in "add new" mode. When it's > 0, we're editing.
  const [formData, setFormData] = useState<Book>({ ...emptyBook });

  // Controls whether the form section is visible or hidden
  const [showForm, setShowForm] = useState<boolean>(false);

  // Tracks whether we're editing an existing book or adding a new one
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Loading state for the table
  const [loading, setLoading] = useState<boolean>(true);

  // Success/error messages shown after an operation completes
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  // ---- Fetch all books when the component first loads ----
  // We use a large pageSize to get all books at once for the admin view
  useEffect(() => {
    fetchBooks();
  }, []);

  // fetchBooks: Loads all books from the API.
  // We request a large page size (100) so we get everything in one call.
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?pageSize=100`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books);
      }
    } catch {
      showMessage('Failed to load books', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // showMessage: Displays a temporary success or error message.
  // The message automatically disappears after 3 seconds.
  const showMessage = (text: string, type: string) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // handleInputChange: Called every time the user types in a form field.
  // It updates the formData state with the new value.
  // For number fields (pageCount, price), we convert the string to a number.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'pageCount'
          ? parseInt(value) || 0
          : name === 'price'
            ? parseFloat(value) || 0
            : value,
    }));
  };

  // handleSubmit: Called when the user clicks "Save" on the form.
  // If we're editing (isEditing = true), it sends a PUT request.
  // If we're adding (isEditing = false), it sends a POST request.
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the browser from doing a full page reload (default form behavior)
    e.preventDefault();

    try {
      let response: Response;

      if (isEditing) {
        // UPDATE an existing book -- send a PUT request with the book data
        response = await fetch(`${API_URL}/${formData.bookID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // CREATE a new book -- send a POST request with the book data.
        // We spread formData but set bookID to 0 so the database auto-generates it.
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, bookID: 0 }),
        });
      }

      if (response.ok || response.status === 201 || response.status === 204) {
        showMessage(
          isEditing ? 'Book updated successfully!' : 'Book added successfully!',
          'success'
        );
        // Reset the form and refresh the book list
        resetForm();
        fetchBooks();
      } else {
        showMessage('Failed to save book. Please check all fields.', 'danger');
      }
    } catch {
      showMessage('Network error. Is the backend running?', 'danger');
    }
  };

  // handleEdit: Called when the user clicks the "Edit" button on a book row.
  // It loads that book's data into the form and switches to edit mode.
  const handleEdit = (book: Book) => {
    setFormData({ ...book });
    setIsEditing(true);
    setShowForm(true);
    // Scroll to the top so the user can see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // handleDelete: Called when the user clicks the "Delete" button on a book row.
  // It shows a confirmation dialog first, then sends a DELETE request if confirmed.
  const handleDelete = async (bookID: number, title: string) => {
    // window.confirm shows a browser popup with OK/Cancel buttons
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return; // User clicked Cancel, so do nothing
    }

    try {
      const response = await fetch(`${API_URL}/${bookID}`, {
        method: 'DELETE',
      });

      if (response.ok || response.status === 204) {
        showMessage('Book deleted successfully!', 'success');
        fetchBooks(); // Refresh the table
      } else {
        showMessage('Failed to delete book.', 'danger');
      }
    } catch {
      showMessage('Network error. Is the backend running?', 'danger');
    }
  };

  // resetForm: Clears the form back to empty values and hides it
  const resetForm = () => {
    setFormData({ ...emptyBook });
    setIsEditing(false);
    setShowForm(false);
  };

  // handleAddNew: Shows the form in "add new book" mode
  const handleAddNew = () => {
    setFormData({ ...emptyBook });
    setIsEditing(false);
    setShowForm(true);
  };

  // ---- Render ----
  return (
    <div>
      <h2 className="mb-4">📋 Admin: Manage Books</h2>

      {/* Success/error message banner using Bootstrap alerts */}
      {message && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage(null)}
          ></button>
        </div>
      )}

      {/* "Add New Book" button -- toggles the form open */}
      <button className="btn btn-success mb-3" onClick={handleAddNew}>
        + Add New Book
      </button>

      {/* ============================================================
          ADD / EDIT FORM
          This form appears when the user clicks "Add New Book" or "Edit".
          It uses Bootstrap's form classes for styling and grid (row/col)
          for laying out the fields in a two-column grid.
          ============================================================ */}
      {showForm && (
        <div className="card mb-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              {isEditing ? '✏️ Edit Book' : '➕ Add New Book'}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Bootstrap Grid: two columns of form fields side by side */}
              <div className="row g-3">
                {/* Title field */}
                <div className="col-md-6">
                  <label htmlFor="title" className="form-label">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Author field */}
                <div className="col-md-6">
                  <label htmlFor="author" className="form-label">
                    Author <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Publisher field */}
                <div className="col-md-6">
                  <label htmlFor="publisher" className="form-label">
                    Publisher <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="publisher"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* ISBN field */}
                <div className="col-md-6">
                  <label htmlFor="isbn" className="form-label">
                    ISBN <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Classification dropdown (Fiction or Non-Fiction) */}
                <div className="col-md-6">
                  <label htmlFor="classification" className="form-label">
                    Classification <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="classification"
                    name="classification"
                    value={formData.classification}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                  </select>
                </div>

                {/* Category field */}
                <div className="col-md-6">
                  <label htmlFor="category" className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Biography, Self-Help, Classic"
                  />
                </div>

                {/* Page Count field (number input) */}
                <div className="col-md-6">
                  <label htmlFor="pageCount" className="form-label">
                    Page Count <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="pageCount"
                    name="pageCount"
                    value={formData.pageCount || ''}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>

                {/* Price field (number input with decimal support) */}
                <div className="col-md-6">
                  <label htmlFor="price" className="form-label">
                    Price ($) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="price"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Form action buttons */}
              <div className="mt-3">
                <button type="submit" className="btn btn-primary me-2">
                  {isEditing ? 'Update Book' : 'Add Book'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          BOOKS TABLE - Shows all books with Edit and Delete buttons.
          Uses Bootstrap's table-responsive wrapper so it scrolls
          horizontally on small screens instead of breaking the layout.
          ============================================================ */}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Publisher</th>
                <th>ISBN</th>
                <th>Classification</th>
                <th>Category</th>
                <th>Pages</th>
                <th>Price</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.bookID}>
                  <td>{book.bookID}</td>
                  <td className="fw-semibold">{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.publisher}</td>
                  <td><small>{book.isbn}</small></td>
                  <td>{book.classification}</td>
                  <td>
                    <span className="badge bg-secondary">{book.category}</span>
                  </td>
                  <td>{book.pageCount}</td>
                  <td>${book.price.toFixed(2)}</td>
                  <td>
                    {/* Edit button -- loads this book's data into the form */}
                    <button
                      className="btn btn-outline-warning btn-sm me-1"
                      onClick={() => handleEdit(book)}
                    >
                      Edit
                    </button>
                    {/* Delete button -- shows confirmation before deleting */}
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(book.bookID, book.title)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminBooks;
