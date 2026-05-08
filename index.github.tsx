/**
 * Entry point cho GitHub — CHỈ Studio, không cần login/trang chủ/admin
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './authContext';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
