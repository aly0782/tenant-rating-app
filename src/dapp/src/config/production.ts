export const PRODUCTION_CONFIG = {
  // Domain configuration
  domain: 'https://reitx.xyz',
  
  // TON Network configuration
  network: 'testnet' as const, // Change to 'mainnet' for production
  
  // Contract addresses (update after deployment)
  contracts: {
    reitxFactory: 'EQBvW5S6UqG5w7gK7eHH_JOuWJB9G3jDq5pR8QZtPbGlCxZ0', // Replace with deployed address
  },
  
  // TON Connect configuration
  tonConnect: {
    manifestUrl: 'https://reitx.xyz/tonconnect-manifest.json',
    network: 'testnet', // Change to 'mainnet' for production
  },
  
  // API endpoints
  api: {
    tonCenter: {
      testnet: 'https://testnet.toncenter.com/api/v2/',
      mainnet: 'https://toncenter.com/api/v2/',
    }
  },
  
  // Feature flags
  features: {
    debugMode: false,
    enableAnalytics: true,
    enableErrorReporting: true,
  },
  
  // Application metadata
  app: {
    name: 'REITx',
    description: 'Tokenized Real Estate Investment Platform on TON',
    version: '1.0.0',
  }
};