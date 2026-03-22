using Microsoft.AspNetCore.Mvc;
using BookstoreAPI.Data;
using BookstoreAPI.Models;

namespace BookstoreAPI.Controllers
{
    // This controller handles all HTTP requests related to books.
    // It is decorated with [ApiController] which tells ASP.NET this is a REST API controller,
    // and [Route] sets the base URL path to "api/Books".
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        // This private field holds a reference to the database context.
        // We use it to query the Books table in the SQLite database.
        private readonly BookstoreContext _context;

        // Constructor: ASP.NET automatically provides (injects) the BookstoreContext
        // when this controller is created. This is called "dependency injection."
        public BooksController(BookstoreContext context)
        {
            _context = context;
        }

        // GET: api/Books
        // This endpoint returns a paginated, optionally filtered and sorted list of books.
        // The frontend calls this endpoint and passes query parameters in the URL like:
        //   /api/Books?pageNumber=1&pageSize=5&category=Biography&sortByTitle=asc
        //
        // Query parameters:
        //   pageNumber  - which page of results to return (default: 1)
        //   pageSize    - how many books to show per page (default: 5)
        //   sortByTitle - pass "asc" for A-Z or "desc" for Z-A sorting by book title
        //   category    - filter to only show books in a specific category (e.g., "Biography")
        [HttpGet]
        public ActionResult<object> GetBooks(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] string? sortByTitle = null,
            [FromQuery] string? category = null)
        {
            // Start with ALL books in the database.
            // IQueryable means the query hasn't run yet -- it builds up like a recipe
            // and only executes when we call .ToList() at the end.
            IQueryable<Book> query = _context.Books;

            // If the user selected a specific category, filter the results
            // so only books matching that category are included.
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(b => b.Category == category);
            }

            // If the user wants to sort by title, apply the appropriate ordering.
            // "asc" sorts A to Z, "desc" sorts Z to A.
            if (!string.IsNullOrEmpty(sortByTitle))
            {
                query = sortByTitle.ToLower() == "desc"
                    ? query.OrderByDescending(b => b.Title)
                    : query.OrderBy(b => b.Title);
            }

            // Count how many books match the current filters (before pagination).
            // This is needed so the frontend knows how many page buttons to show.
            var totalBooks = query.Count();

            // Calculate total pages by dividing total books by page size, rounding up.
            // For example: 16 books / 5 per page = 3.2, rounded up = 4 pages.
            var totalPages = (int)Math.Ceiling((double)totalBooks / pageSize);

            // Use Skip and Take to get only the books for the requested page.
            // Skip jumps past the books on previous pages, Take grabs the current page's books.
            // Example: page 2, size 5 => Skip(5).Take(5) gives books 6-10.
            var books = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            // Return the books along with pagination info as a JSON object.
            // The frontend uses totalPages to build the correct number of page buttons.
            return Ok(new
            {
                books,
                totalBooks,
                totalPages,
                currentPage = pageNumber,
                pageSize
            });
        }

        // GET: api/Books/categories
        // This endpoint returns a list of all unique book categories in the database.
        // The frontend uses this to build the category filter buttons (e.g., "Biography", "Self-Help").
        [HttpGet("categories")]
        public ActionResult<IEnumerable<string>> GetCategories()
        {
            // Select just the Category column from every book, remove duplicates with Distinct(),
            // sort them alphabetically, and return as a list.
            var categories = _context.Books
                .Select(b => b.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToList();

            return Ok(categories);
        }
    }
}
