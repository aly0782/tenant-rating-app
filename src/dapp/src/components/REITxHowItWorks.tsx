import React from 'react';

export function REITxHowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Browse Opportunities',
      description: 'REITx is a crypto-native real estate investment platform on TON. We tokenize real properties like restaurants and apartments in Lisbon, Portugal, so you can invest from 100 TON and earn monthly yield.'
    },
    {
      number: '2', 
      title: 'Invest with TON',
      description: 'Choose a property and invest from 100 TON using your TON wallet. No banks, no paperwork, fully decentralized on the TON blockchain.'
    },
    {
      number: '3',
      title: 'Earn Monthly Yield',
      description: 'Get paid monthly in TON from rental income or revenue-share, directly to your wallet through smart contracts.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three simple steps to start earning passive income from real estate on the TON blockchain
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-300 transform translate-x-4"></div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}