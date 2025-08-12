import React from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';

export function REITxHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            REITx on TON
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Co-Own Real Estate. Earn Monthly Yield.
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            REITx lets you invest in income-producing properties for as little as 100 TON — and earn monthly TON payouts, powered by The Open Network.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg transition-colors"
              onClick={() => {
                const element = document.getElementById('how-it-works');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              HOW IT WORKS
            </button>
            <button 
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg font-semibold rounded-lg transition-colors"
              onClick={() => {
                const element = document.getElementById('properties');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              START EARNING
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500">
              Ready to invest? Connect your TON wallet to get started
            </p>
            <TonConnectButton />
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}