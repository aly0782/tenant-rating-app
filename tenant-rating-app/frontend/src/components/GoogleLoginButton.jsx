import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const API = 'http://localhost:5001';

/**
 * Sends idToken to backend, stores JWT, calls onSuccess(user).
 */
export default function GoogleLoginButton({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError('No credential received from Google.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      onSuccess?.(data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    setError('Google sign-in was cancelled or failed.');
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="filled_black"
        size="large"
        text="continue_with"
      />
      {loading && (
        <p className="text-sm text-gray-500">Signing you in...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 max-w-xs text-center">{error}</p>
      )}
    </div>
  );
}
