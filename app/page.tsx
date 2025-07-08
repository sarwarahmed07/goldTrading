
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [goldPrice, setGoldPrice] = useState(2385.50);
  const [priceChange, setPriceChange] = useState(12.30);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Simulate real-time gold price updates
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 10;
      setGoldPrice(prev => Math.max(prev + change, 2300));
      setPriceChange(change);
    }, 3000);

    // Simulate online status
    setIsOnline(true);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="bg-blue-900/90 backdrop-blur-sm border-b border-blue-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <i className="ri-copper-coin-line text-white text-lg"></i>
                </div>
                <h1 className="text-2xl font-bold text-yellow-400" style={{fontFamily: 'var(--font-pacifico)'}}>
                  MMS Gold
                </h1>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium cursor-pointer">
                Home
              </Link>
              <Link href="/about" className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium cursor-pointer">
                About
              </Link>
              <Link href="/services" className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium cursor-pointer">
                Services
              </Link>
              <Link href="/trading" className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium cursor-pointer">
                Trading
              </Link>
              <Link href="/gold-growth" className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium cursor-pointer">
                Gold Growth
              </Link>
              <Link href="/building-trade" className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium cursor-pointer">
                Building Trade
              </Link>
              <Link href="/education" className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium cursor-pointer">
                Education
              </Link>
              <Link href="/support" className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium cursor-pointer">
                Support
              </Link>
              <Link href="/contact" className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium cursor-pointer">
                Contact
              </Link>
              <Link href="/login" className="bg-yellow-500 text-blue-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-400 cursor-pointer whitespace-nowrap">
                Login
              </Link>
              <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-400 cursor-pointer whitespace-nowrap">
                Sign Up
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <img 
            src="https://readdy.ai/api/search-image?query=Luxurious%20gold%20trading%20platform%20background%20with%20golden%20coins%20floating%20in%20deep%20blue%20space%2C%20professional%20financial%20technology%20interface%2C%20AI-powered%20trading%20algorithms%20visualization%2C%20modern%20digital%20gold%20investment%20concept%20with%20glowing%20effects&width=1400&height=800&seq=hero-gold&orientation=landscape"
            alt="Gold Trading Platform"
            className="w-full h-full object-cover object-top opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            MMS Gold
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto">
            Your all-in-all gold trading platform with AI-powered solutions, fixed deposits, and the revolutionary GoldGrowth Network
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/trading" className="bg-yellow-500 text-blue-900 px-8 py-3 rounded-md text-lg font-medium hover:bg-yellow-400 cursor-pointer whitespace-nowrap">
              Start Trading Now
            </Link>
            <button className="border-2 border-white text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-white hover:text-blue-900 cursor-pointer whitespace-nowrap">
              Learn More
            </button>
          </div>

          {/* Real-time Gold Price */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto mb-12">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-white text-lg font-semibold">Live Gold Price</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 text-2xl font-bold">${goldPrice.toFixed(2)}</span>
                  <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-white text-sm">{isOnline ? 'Live' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Forex Gold Trading */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-line-chart-line text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Forex Gold Trading</h3>
              <p className="text-blue-200 text-sm">Advanced gold trading with real-time market analysis</p>
            </div>

            {/* Secure Platform */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-blue-200 text-sm">Bank-level security with advanced encryption</p>
            </div>

            {/* AI Powered Trading */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-robot-line text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">AI Powered Trading</h3>
              <p className="text-blue-200 text-sm">Intelligent algorithms for optimal trading decisions</p>
            </div>

            {/* High Returns */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-money-dollar-circle-line text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">High Returns</h3>
              <p className="text-blue-200 text-sm">Competitive returns with flexible investment options</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Trading Services</h2>
            <p className="text-xl text-blue-200">Comprehensive trading solutions for every investor</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Web Trading */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-global-line text-white text-xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Web Trading</h3>
              <p className="text-blue-200 mb-4">Advanced web-based trading platform with real-time charts and analysis tools</p>
              <Link href="/trading/web" className="text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer">
                Learn More →
              </Link>
            </div>

            {/* Bot Trading */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-robot-line text-white text-xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Bot & EA Trading</h3>
              <p className="text-blue-200 mb-4">Automated trading with expert advisors and intelligent bots</p>
              <Link href="/trading/bot" className="text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer">
                Learn More →
              </Link>
            </div>

            {/* MT4/MT5 Trading */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-computer-line text-white text-xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">MT4/MT5 Trading</h3>
              <p className="text-blue-200 mb-4">Professional MetaTrader platforms for advanced traders</p>
              <Link href="/trading/metatrader" className="text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer">
                Learn More →
              </Link>
            </div>

            {/* Gold Predictions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-brain-line text-white text-xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Gold Predictions</h3>
              <p className="text-blue-200 mb-4">AI-powered gold price predictions and market analysis</p>
              <Link href="/predictions" className="text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer">
                Learn More →
              </Link>
            </div>

            {/* Fixed Deposits */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-safe-line text-white text-xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Fixed Deposits</h3>
              <p className="text-blue-200 mb-4">Secure fixed deposit plans with guaranteed returns</p>
              <Link href="/deposits" className="text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer">
                Learn More →
              </Link>
            </div>

            {/* GoldGrowth Network */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all cursor-pointer">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-team-line text-white text-xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">GoldGrowth Network</h3>
              <p className="text-blue-200 mb-4">Revolutionary referral program with multiple income streams</p>
              <Link href="/goldgrowth" className="text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer">
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-500 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Start Your Gold Trading Journey Today
          </h2>
          <p className="text-xl text-blue-800 mb-8">
            Join thousands of successful traders on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-blue-900 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-800 cursor-pointer whitespace-nowrap">
              Create Account
            </Link>
            <Link href="/demo" className="border-2 border-blue-900 text-blue-900 px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-900 hover:text-white cursor-pointer whitespace-nowrap">
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 border-t border-blue-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <i className="ri-copper-coin-line text-white text-lg"></i>
                </div>
                <h3 className="text-2xl font-bold text-yellow-400" style={{fontFamily: 'var(--font-pacifico)'}}>
                  MMS Gold
                </h3>
              </div>
              <p className="text-blue-200 mb-4">
                Your trusted partner for gold trading and investment solutions with AI-powered technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-facebook-fill text-blue-400 text-xl cursor-pointer hover:text-white"></i>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-twitter-fill text-blue-400 text-xl cursor-pointer hover:text-white"></i>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-linkedin-fill text-blue-400 text-xl cursor-pointer hover:text-white"></i>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <i className="ri-instagram-line text-blue-400 text-xl cursor-pointer hover:text-white"></i>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Trading</h4>
              <ul className="space-y-2 text-blue-200">
                <li><Link href="/trading/web" className="hover:text-white cursor-pointer">Web Trading</Link></li>
                <li><Link href="/trading/mobile" className="hover:text-white cursor-pointer">Mobile Trading</Link></li>
                <li><Link href="/trading/bot" className="hover:text-white cursor-pointer">Bot Trading</Link></li>
                <li><Link href="/predictions" className="hover:text-white cursor-pointer">Gold Predictions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-blue-200">
                <li className="flex items-center">
                  <i className="ri-mail-line mr-2"></i>
                  support@mmsgold.com
                </li>
                <li className="flex items-center">
                  <i className="ri-phone-line mr-2"></i>
                  +1 (888) 123-GOLD
                </li>
                <li className="flex items-center">
                  <i className="ri-time-line mr-2"></i>
                  24/7 Support
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-blue-800 text-center text-blue-300">
            <p>&copy; 2024 MMS Gold Trading Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
