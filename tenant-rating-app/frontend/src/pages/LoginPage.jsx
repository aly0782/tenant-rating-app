import React from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-sm border border-gray-200 p-8 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Tenant Rating App</h1>
        <p className="text-gray-500 text-sm mb-6">Portugal & India</p>
        <p className="text-gray-600 mb-6">Sign in with Google to continue</p>
        <GoogleLoginButton onSuccess={onLogin} />
      </div>
    </div>
  );
}
