import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoogleLoginButton from './components/GoogleLoginButton';

const API = 'http://localhost:5001';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(`${API}/api/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setLoggedInUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoggedInUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-sm border border-gray-200 p-8 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Tenant Rating App</h1>
        <p className="text-gray-500 text-sm mb-6">Portugal & India</p>

        {loggedInUser ? (
          <>
            <p className="text-gray-700 mb-2">Welcome, <span className="font-semibold text-gray-900">{loggedInUser.name}</span></p>
            <p className="text-gray-500 text-sm mb-6">{loggedInUser.email}</p>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">Sign in with Google to continue</p>
            <GoogleLoginButton onSuccess={setLoggedInUser} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
