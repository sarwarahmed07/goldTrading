
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserDashboardData {
  user: {
    username: string;
    email: string;
    balance: number;
    referralCode: string;
  };
  investments: any[];
  positions: any[];
  recentTransactions: any[];
}

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
    fetchDashboardData();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/verify');
      if (!response.ok) {
        router.push('/login');
        return;
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [investmentsRes, positionsRes] = await Promise.all([
        fetch('/api/investments/manage'),
        fetch('/api/trading/positions')
      ]);

      if (investmentsRes.ok && positionsRes.ok) {
        const [investmentsData, positionsData] = await Promise.all([
          investmentsRes.json(),
          positionsRes.json()
        ]);

        setDashboardData({
          user: {
            username: 'User',
            email: 'user@example.com',
            balance: 10000,
            referralCode: 'MMS-REF-123'
          },
          investments: investmentsData.investments || [],
          positions: positionsData.positions || [],
          recentTransactions: []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
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
                <span className="font-bold text-green-400">${dashboardData?.user.balance.toLocaleString()}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 cursor-pointer whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-2 rounded-md cursor-pointer ${
                    activeTab === 'overview' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <i className="ri-dashboard-line mr-2"></i>
                  Overview
                </button>
              </li>
              <li>
                <Link href="/trading" className="block w-full text-left px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 cursor-pointer">
                  <i className="ri-line-chart-line mr-2"></i>
                  Trading
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('investments')}
                  className={`w-full text-left px-4 py-2 rounded-md cursor-pointer ${
                    activeTab === 'investments' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <i className="ri-safe-line mr-2"></i>
                  Investments
                </button>
              </li>
              <li>
                <Link href="/goldgrowth" className="block w-full text-left px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 cursor-pointer">
                  <i className="ri-team-line mr-2"></i>
                  GoldGrowth Network
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`w-full text-left px-4 py-2 rounded-md cursor-pointer ${
                    activeTab === 'transactions' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <i className="ri-exchange-line mr-2"></i>
                  Transactions
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <i className="ri-money-dollar-circle-line text-white text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-400">Account Balance</p>
                      <p className="text-2xl font-bold text-white">${dashboardData?.user.balance.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <i className="ri-safe-line text-white text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-400">Active Investments</p>
                      <p className="text-2xl font-bold text-white">{dashboardData?.investments.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <i className="ri-line-chart-line text-white text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-400">Open Positions</p>
                      <p className="text-2xl font-bold text-white">{dashboardData?.positions.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                      <i className="ri-team-line text-white text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-400">Referral Code</p>
                      <p className="text-lg font-bold text-white">{dashboardData?.user.referralCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/trading" className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white hover:from-blue-700 hover:to-purple-700 cursor-pointer">
                  <i className="ri-line-chart-line text-3xl mb-4"></i>
                  <h3 className="text-xl font-bold mb-2">Start Trading</h3>
                  <p className="text-blue-100">Trade gold and other instruments with leverage</p>
                </Link>

                <button 
                  onClick={() => setActiveTab('investments')}
                  className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white hover:from-green-700 hover:to-blue-700 cursor-pointer"
                >
                  <i className="ri-safe-line text-3xl mb-4"></i>
                  <h3 className="text-xl font-bold mb-2">Invest Now</h3>
                  <p className="text-green-100">Choose from 3, 6, or 12 day investment plans</p>
                </button>

                <Link href="/goldgrowth" className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-white hover:from-yellow-700 hover:to-orange-700 cursor-pointer">
                  <i className="ri-team-line text-3xl mb-4"></i>
                  <h3 className="text-xl font-bold mb-2">Refer & Earn</h3>
                  <p className="text-yellow-100">Build your network and earn commissions</p>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Investment Plans</h1>
              <InvestmentSection />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Transaction History</h1>
              <p className="text-gray-400">Transaction history will be displayed here.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Investment component
function InvestmentSection() {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: '3 Days Plan',
      duration: 3,
      dailyRate: 5.5,
      minAmount: 2000,
      maxAmount: 5000,
      totalReturn: 16.5
    },
    {
      name: '6 Days Plan',
      duration: 6,
      dailyRate: 7.5,
      minAmount: 5000,
      maxAmount: 15000,
      totalReturn: 45
    },
    {
      name: '12 Days Plan',
      duration: 12,
      dailyRate: 9.5,
      minAmount: 15000,
      maxAmount: 50000,
      totalReturn: 114
    }
  ];

  const handleInvest = async () => {
    if (!selectedPlan || !amount) {
      alert('Please select a plan and enter amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/investments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: parseFloat(amount)
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Investment created successfully!');
        setSelectedPlan('');
        setAmount('');
      } else {
        alert(data.error || 'Investment failed');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Investment Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`bg-gray-800 rounded-lg p-6 border-2 cursor-pointer ${
              selectedPlan === plan.name ? 'border-yellow-500' : 'border-gray-700'
            }`}
            onClick={() => setSelectedPlan(plan.name)}
          >
            <h3 className="text-xl font-bold text-white mb-4">{plan.name}</h3>
            <div className="space-y-2 text-gray-300">
              <p>Duration: {plan.duration} days</p>
              <p>Daily Return: {plan.dailyRate}%</p>
              <p>Total Return: {plan.totalReturn}%</p>
              <p>Min: ${plan.minAmount.toLocaleString()}</p>
              <p>Max: ${plan.maxAmount.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Investment Form */}
      {selectedPlan && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Invest in {selectedPlan}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Investment Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
                placeholder="Enter amount"
              />
            </div>
            <button
              onClick={handleInvest}
              disabled={loading}
              className="w-full bg-yellow-500 text-gray-900 py-3 px-4 rounded font-semibold hover:bg-yellow-400 disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {loading ? 'Processing...' : 'Invest Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
