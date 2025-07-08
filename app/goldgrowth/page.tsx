
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function GoldGrowthPage() {
  const [referralCode, setReferralCode] = useState('MMS-GOLD-2024-001');
  const [earnings, setEarnings] = useState({
    totalReferrals: 12,
    monthlyCommission: 2450.00,
    totalEarnings: 18750.00,
    activeReferrals: 8
  });

  const handleGenerateCode = () => {
    const newCode = `MMS-GOLD-${Date.now().toString().slice(-6)}`;
    setReferralCode(newCode);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://mmsgold.com/register?ref=${referralCode}`);
    alert('Referral link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-800 to-amber-900">
      {/* Header */}
      <header className="bg-yellow-900/90 backdrop-blur-sm border-b border-yellow-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <i className="ri-copper-coin-line text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-bold text-yellow-400" style={{fontFamily: 'var(--font-pacifico)'}}>
                MMS Gold
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium cursor-pointer">
                Dashboard
              </Link>
              <Link href="/trading" className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-400 cursor-pointer whitespace-nowrap">
                Start Trading
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <img 
            src="https://readdy.ai/api/search-image?query=Golden%20network%20growth%20concept%20with%20interconnected%20golden%20lines%20and%20nodes%2C%20professional%20financial%20network%20visualization%2C%20luxury%20gold%20investment%20theme%2C%20warm%20golden%20lighting%20with%20business%20people%20silhouettes%20in%20background%2C%20prosperity%20and%20growth%20symbolism&width=1400&height=800&seq=goldgrowth-hero&orientation=landscape"
            alt="GoldGrowth Network"
            className="w-full h-full object-cover object-top opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            GoldGrowth Network
          </h1>
          <p className="text-xl md:text-2xl text-yellow-200 mb-8 max-w-3xl mx-auto">
            Build your wealth through our revolutionary referral program. Earn commissions, build your network, and grow your income exponentially.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-yellow-500 text-yellow-900 px-8 py-3 rounded-md text-lg font-medium hover:bg-yellow-400 cursor-pointer whitespace-nowrap">
              Join Network
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-white hover:text-yellow-900 cursor-pointer whitespace-nowrap">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Earnings Dashboard */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-group-line text-white text-xl"></i>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{earnings.totalReferrals}</div>
              <div className="text-yellow-200">Total Referrals</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-money-dollar-circle-line text-white text-xl"></i>
              </div>
              <div className="text-3xl font-bold text-white mb-2">${earnings.monthlyCommission.toLocaleString()}</div>
              <div className="text-yellow-200">Monthly Commission</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-trophy-line text-white text-xl"></i>
              </div>
              <div className="text-3xl font-bold text-white mb-2">${earnings.totalEarnings.toLocaleString()}</div>
              <div className="text-yellow-200">Total Earnings</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-user-star-line text-white text-xl"></i>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{earnings.activeReferrals}</div>
              <div className="text-yellow-200">Active Referrals</div>
            </div>
          </div>

          {/* Referral Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Referral Code Generator */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Your Referral Tools</h3>
              
              <div className="mb-6">
                <label className="block text-yellow-200 text-sm font-medium mb-2">
                  Your Referral Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-l-md border border-gray-600 focus:outline-none"
                  />
                  <button
                    onClick={handleGenerateCode}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Generate New
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-yellow-200 text-sm font-medium mb-2">
                  Referral Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={`https://mmsgold.com/register?ref=${referralCode}`}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-l-md border border-gray-600 focus:outline-none text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 cursor-pointer whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                  <i className="ri-share-line mr-2"></i>
                  Share Link
                </button>
                <button className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 cursor-pointer whitespace-nowrap">
                  <i className="ri-qr-code-line mr-2"></i>
                  QR Code
                </button>
              </div>
            </div>

            {/* Commission Structure */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white mb-6">Commission Structure</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-600/20 rounded">
                  <div>
                    <div className="text-white font-semibold">Level 1 (Direct Referrals)</div>
                    <div className="text-yellow-200 text-sm">Your direct referrals</div>
                  </div>
                  <div className="text-green-400 font-bold">15%</div>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-600/20 rounded">
                  <div>
                    <div className="text-white font-semibold">Level 2 (Sub-referrals)</div>
                    <div className="text-yellow-200 text-sm">Referrals of your referrals</div>
                  </div>
                  <div className="text-blue-400 font-bold">10%</div>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-600/20 rounded">
                  <div>
                    <div className="text-white font-semibold">Level 3 (Deep Network)</div>
                    <div className="text-yellow-200 text-sm">Third level referrals</div>
                  </div>
                  <div className="text-purple-400 font-bold">5%</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-600/20 rounded">
                <div className="text-yellow-200 text-sm">Monthly Bonus</div>
                <div className="text-white font-semibold">Extra 2% for top performers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Benefits */}
      <section className="py-16 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Network Benefits</h2>
            <p className="text-xl text-yellow-200">Exclusive advantages for GoldGrowth Network members</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-line-chart-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Passive Income</h3>
              <p className="text-yellow-200">Earn continuous commissions from your network's trading activity</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-award-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">VIP Status</h3>
              <p className="text-yellow-200">Unlock exclusive features and premium trading tools</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-team-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Team Support</h3>
              <p className="text-yellow-200">Dedicated support team to help grow your network</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-gift-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bonus Rewards</h3>
              <p className="text-yellow-200">Monthly bonuses and special rewards for top performers</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-graduation-cap-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Training Program</h3>
              <p className="text-yellow-200">Comprehensive training to maximize your earning potential</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-global-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Global Network</h3>
              <p className="text-yellow-200">Connect with traders and investors worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Build Your Golden Network?
          </h2>
          <p className="text-xl text-yellow-200 mb-8">
            Start earning commissions today and build your financial future
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-yellow-500 text-yellow-900 px-8 py-3 rounded-md text-lg font-medium hover:bg-yellow-400 cursor-pointer whitespace-nowrap">
              Join Network Now
            </button>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-white hover:text-yellow-900 cursor-pointer whitespace-nowrap">
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-yellow-900 border-t border-yellow-700">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-200">&copy; 2024 MMS Gold - GoldGrowth Network. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
