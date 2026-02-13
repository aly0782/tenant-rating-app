import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SearchPeople from './pages/SearchPeople';
import ProfilePage from './pages/ProfilePage';

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
      <main className="min-h-[calc(100vh-3.5rem)] flex flex-col" style={{ backgroundColor: '#FAFBFC' }}>
        <Outlet />
      </main>
      <Footer />
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
        <Route path="/search" element={<SearchPeople />} />
        <Route path="/person/:id" element={<ProfilePage />} />
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
