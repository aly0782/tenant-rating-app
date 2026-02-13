import React from 'react';

/**
 * TrustNest hero: dark blue (#0F3460), white text, large heading + subheading.
 */
export default function HeroSection({ heading, subheading }) {
  return (
    <section
      className="w-full pt-14 pb-16 px-4 text-center"
      style={{ backgroundColor: '#0F3460' }}
    >
      <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight max-w-3xl mx-auto">
        {heading || 'Find & rate landlords and tenants'}
      </h1>
      {subheading && (
        <p className="text-white/90 text-lg sm:text-xl mt-4 max-w-2xl mx-auto">
          {subheading}
        </p>
      )}
    </section>
  );
}
