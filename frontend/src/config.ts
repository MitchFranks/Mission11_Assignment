// ============================================================
// config.ts - Shared Configuration for the Frontend App
// ============================================================
// This file stores settings that are used across multiple components.
// By putting the API URL here in one place, we only need to change
// it once when switching between local development and Azure deployment.
// ============================================================

// The base URL for the ASP.NET Core backend API.
// When running locally, this points to localhost:5156.
// When deployed to Azure, this points to the Azure App Service URL.
export const API_URL = 'https://bookstoreapi-ccadgsdcbxbqehe9.eastus-01.azurewebsites.net/api/Books';
