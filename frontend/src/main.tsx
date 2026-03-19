import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import Bootstrap CSS for styling the entire app
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App.tsx';

// Mount the React app into the root DOM element
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
