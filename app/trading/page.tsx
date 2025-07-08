
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TradingChart from './TradingChart';
import TradingPanel from './TradingPanel';

export default function TradingPage() {
  const [goldPrice, setGoldPrice] = useState(2385.50);
  const [balance, setBalance] = useState(0);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        const data = await response.json();
        setAuthenticated(true);
        setBalance(data.user.balance || 10000);
        await fetchPositions();
      } else {
        router.push('/login');
        return;
      }
    } catch (error) {
      router.push('/login');
      return;
    }
    setLoading(false);
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/trading/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data.positions || []);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const handleTrade = async (type: 'buy' | 'sell', amount: number, leverage: number) => {
    try {
      const response = await fetch('/api/trading/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          instrument: 'XAUUSD',
          type,
          amount,
          leverage
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchPositions();
        setBalance(prev => prev - amount);
        alert('Trade executed successfully!');
      } else {
        alert(data.error || 'Trade failed');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleClosePosition = async (positionId: string) => {
    try {
      const response = await fetch('/api/trading/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'close',
          positionId
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchPositions();
        alert('Position closed successfully!');
      } else {
        alert(data.error || 'Failed to close position');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 5;
      setGoldPrice(prev => Math.max(prev + change, 2300));
    }, 2000);

    return () => clearInterval(interval);
  }, [authenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
          <i className="ri-lock-line text-6xl text-yellow-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-300 mb-6">Please log in to access the trading platform</p>
          <Link href="/login" className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-md font-semibold hover:bg-yellow-400 cursor-pointer whitespace-nowrap">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      {/* Header */}
      <header className="bg-blue-900/90 backdrop-blur-sm border-b border-blue-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <i className="ri-copper-coin-line text-white text-lg"></i>
                </div>
                <h1 className="text-2xl font-bold text-yellow-400" style={{fontFamily: 'var(--font-pacifico)'}}>
                  MMS Gold
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <span className="text-sm">Balance: </span>
                <span className="font-bold text-green-400">${balance.toLocaleString()}</span>
              </div>
              <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer whitespace-nowrap">
                Emergency Stop
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="flex h-screen pt-16">
        {/* Trading Chart */}
        <div className="flex-1 p-4">
          <TradingChart goldPrice={goldPrice} />
        </div>

        {/* Trading Panel */}
        <div className="w-80 bg-blue-900/50 backdrop-blur-sm border-l border-blue-700 p-4">
          <TradingPanel 
            goldPrice={goldPrice} 
            balance={balance}
            setBalance={setBalance}
            positions={positions}
            setPositions={setPositions}
            onTrade={handleTrade}
            onClosePosition={handleClosePosition}
          />
        </div>
      </div>
    </div>
  );
}
