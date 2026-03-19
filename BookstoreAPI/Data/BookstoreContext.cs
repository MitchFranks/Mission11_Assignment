using Microsoft.EntityFrameworkCore;
using BookstoreAPI.Models;

namespace BookstoreAPI.Data
{
    // EF Core DbContext for the Bookstore SQLite database.
    // Provides access to the Books table through the Books DbSet.
    public class BookstoreContext : DbContext
    {
        public BookstoreContext(DbContextOptions<BookstoreContext> options)
            : base(options)
        {
        }

        // DbSet representing the "Books" table in the database
        public DbSet<Book> Books { get; set; }
    }
}
