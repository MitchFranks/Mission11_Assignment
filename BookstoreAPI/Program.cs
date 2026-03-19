using Microsoft.EntityFrameworkCore;
using BookstoreAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Register the BookstoreContext with SQLite as the database provider.
// The connection string is pulled from appsettings.json.
builder.Services.AddDbContext<BookstoreContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("BookstoreConnection")));

// Register controller services so the API endpoints are discovered
builder.Services.AddControllers();

// Configure CORS to allow the React frontend (running on port 3000) to call the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

// Enable the CORS policy for all requests
app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Map controller routes (e.g., api/Books)
app.MapControllers();

app.Run();
