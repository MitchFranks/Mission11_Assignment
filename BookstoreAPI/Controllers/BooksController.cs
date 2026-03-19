using Microsoft.AspNetCore.Mvc;
using BookstoreAPI.Data;
using BookstoreAPI.Models;

namespace BookstoreAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly BookstoreContext _context;

        // Inject the BookstoreContext via dependency injection
        public BooksController(BookstoreContext context)
        {
            _context = context;
        }

        // GET: api/Books
        // Returns a paginated list of books with optional sorting by title.
        // Query parameters:
        //   pageNumber - which page to return (default: 1)
        //   pageSize   - how many books per page (default: 5)
        //   sortByTitle - "asc" or "desc" to sort alphabetically by title
        [HttpGet]
        public ActionResult<object> GetBooks(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] string? sortByTitle = null)
        {
            // Start with all books in the database
            IQueryable<Book> query = _context.Books;

            // Apply sorting by title if requested
            if (!string.IsNullOrEmpty(sortByTitle))
            {
                query = sortByTitle.ToLower() == "desc"
                    ? query.OrderByDescending(b => b.Title)
                    : query.OrderBy(b => b.Title);
            }

            // Calculate the total number of books for pagination metadata
            var totalBooks = query.Count();
            var totalPages = (int)Math.Ceiling((double)totalBooks / pageSize);

            // Retrieve only the books for the requested page
            var books = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            // Return books along with pagination metadata so the frontend
            // can dynamically build page navigation links
            return Ok(new
            {
                books,
                totalBooks,
                totalPages,
                currentPage = pageNumber,
                pageSize
            });
        }
    }
}
