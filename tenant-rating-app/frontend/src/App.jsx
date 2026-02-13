import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import PropertySearch from './pages/PropertySearch';
import PropertyDetail from './pages/PropertyDetail';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function Layout() {
  const { user, logout } = useAuth();
  return (
    <>
      <NavBar user={user} onLogout={logout} />
      <main className="min-h-[calc(100vh-3.5rem)] bg-gray-50">
        <Outlet />
      </main>
    </>
  );
}

function AppRoutes() {
  const { user, setUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/search" replace /> : <LoginPage onLogin={setUser} />}
      />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/search" element={<PropertySearch />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/search' : '/'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
