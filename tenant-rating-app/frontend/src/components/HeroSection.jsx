import React from 'react';

/**
 * TrustNest hero – matches v0: trust badge (gold), then heading + subheading.
 * https://v0-tenant-landlord-platform-olive.vercel.app/
 */
export default function HeroSection({ trustBadge = 'Trusted by 500+ landlords and tenants', heading = 'Find Trusted Landlords & Tenants', subheading = 'The transparent platform where rental relationships are built on verified reviews and real experiences.' }) {
  return (
    <section
      className="w-full pt-12 pb-14 px-4 text-center"
      style={{ backgroundColor: '#0F3460' }}
    >
      <p
        className="text-sm font-semibold uppercase tracking-wider mb-4"
        style={{ color: '#D4AF37' }}
      >
        {trustBadge}
      </p>
      <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight max-w-3xl mx-auto leading-tight">
        {heading}
      </h1>
      {subheading && (
        <p className="text-white/90 text-lg sm:text-xl mt-4 max-w-2xl mx-auto leading-relaxed">
          {subheading}
        </p>
      )}
    </section>
  );
}
