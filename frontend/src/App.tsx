import { createRouter, RouterProvider, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import UserDetailPage from './pages/UserDetailPage';

// Root layout component
function RootLayout() {
  return <Outlet />;
}

// Create routes
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const stored = localStorage.getItem('chatconnect_session');
    if (stored) {
      throw redirect({ to: '/home' });
    } else {
      throw redirect({ to: '/login' });
    }
  },
  component: () => null,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    const stored = localStorage.getItem('chatconnect_session');
    if (stored) {
      throw redirect({ to: '/home' });
    }
  },
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  beforeLoad: () => {
    const stored = localStorage.getItem('chatconnect_session');
    if (stored) {
      throw redirect({ to: '/home' });
    }
  },
  component: SignupPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  beforeLoad: () => {
    const stored = localStorage.getItem('chatconnect_session');
    if (!stored) {
      throw redirect({ to: '/login' });
    }
  },
  component: HomePage,
});

const userDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user/$username',
  beforeLoad: () => {
    const stored = localStorage.getItem('chatconnect_session');
    if (!stored) {
      throw redirect({ to: '/login' });
    }
  },
  component: UserDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  homeRoute,
  userDetailRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
