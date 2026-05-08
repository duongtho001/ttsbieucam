import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './authContext';
import { Router, Route, navigate } from './router';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import App from './App'; // Studio

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1019' }}>
        <div style={{ color: '#a78bfa', fontSize: 14 }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <Router>
      {(route: Route) => {
        // Guard: /studio cần đăng nhập
        if (route === '/studio' && !user) {
          return <RedirectTo to="/login" />;
        }
        // Đã login → redirect từ / về /studio
        if (route === '/' && user) {
          return <RedirectTo to="/studio" />;
        }

        switch (route) {
          case '/':        return <Landing />;
          case '/login':   return <Login />;
          case '/register':return <Register />;
          case '/studio':  return <App />;
          case '/admin':   return <Admin />;
          default:         return <Landing />;
        }
      }}
    </Router>
  );
}

/** Safe redirect component — avoids calling navigate() during render */
function RedirectTo({ to }: { to: Route }) {
  useEffect(() => { navigate(to); }, [to]);
  return null;
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);