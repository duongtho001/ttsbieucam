/**
 * Path-based Router — Clean URLs (no # hash)
 * Routes: /  /login  /register  /studio  /admin
 * Requires .htaccess rewrite on Apache/cPanel
 */
import React, { useState, useEffect, ReactNode } from 'react';

export type Route = '/' | '/login' | '/register' | '/studio' | '/admin';

function getRoute(): Route {
  const path = window.location.pathname;
  // Match known routes
  if (path === '/login') return '/login';
  if (path === '/register') return '/register';
  if (path === '/studio') return '/studio';
  if (path === '/admin') return '/admin';
  return '/';
}

export function navigate(to: Route) {
  window.history.pushState({}, '', to);
  // Dispatch custom event so Router re-renders
  window.dispatchEvent(new PopStateEvent('popstate'));
}

interface RouterProps {
  children: (route: Route) => ReactNode;
}

export function Router({ children }: RouterProps) {
  const [route, setRoute] = useState<Route>(getRoute());

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  return <>{children(route)}</>;
}
