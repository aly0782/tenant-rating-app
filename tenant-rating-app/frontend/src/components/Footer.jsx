import React from 'react';

/**
 * TrustNest footer – matches v0: TrustNest + tagline.
 * https://v0-tenant-landlord-platform-olive.vercel.app/
 */
export default function Footer() {
  return (
    <footer
      className="w-full py-10 px-4 text-center"
      style={{ backgroundColor: '#0F3460' }}
    >
      <h2 className="text-xl font-bold text-white mb-2">TrustNest</h2>
      <p className="text-white/85 text-sm max-w-xl mx-auto leading-relaxed">
        Building transparent rental relationships through verified reviews. All reviews are from real, verified users.
      </p>
    </footer>
  );
}
