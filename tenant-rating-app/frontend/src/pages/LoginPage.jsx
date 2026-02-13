import React from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#FAFBFC' }}>
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-gray-200 p-8 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">TrustNest</h1>
        <p className="text-gray-500 text-sm mb-6">Find trusted landlords & tenants</p>
        <p className="text-gray-700 mb-6">Sign in with Google to continue</p>
        <GoogleLoginButton onSuccess={onLogin} />
      </div>
    </div>
  );
}
