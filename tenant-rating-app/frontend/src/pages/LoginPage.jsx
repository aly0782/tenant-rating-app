import React from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';

export default function LoginPage({ onLogin }) {
  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-neutral-border p-8 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tenant Rating</h1>
        <p className="text-neutral-muted text-sm mb-6">Portugal & India</p>
        <p className="text-gray-700 mb-6">Sign in with Google to continue</p>
        <GoogleLoginButton onSuccess={onLogin} />
      </div>
    </div>
  );
}
