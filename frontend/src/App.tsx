import BookList from './components/BookList';

// Main App component that renders the bookstore layout
function App() {
  return (
    <div className="container mt-4">
      {/* Page header */}
      <div className="text-center mb-4">
        <h1 className="display-4">Online Bookstore</h1>
        <p className="lead text-muted">
          Browse our collection of books
        </p>
        <hr />
      </div>

      {/* Book listing component with pagination and sorting */}
      <BookList />
    </div>
  );
}

export default App;
