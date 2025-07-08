
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  users: {
    total_users: number;
    active_users: number;
    new_users_today: number;
    new_users_week: number;
  };
  transactions: {
    total_transactions: number;
    total_deposits: number;
    total_withdrawals: number;
    transactions_today: number;
  };
  trading: {
    total_trades: number;
    open_positions: number;
    total_profit: number;
    total_loss: number;
  };
  investments: {
    total_investments: number;
    active_investments: number;
    total_invested: number;
    total_returns: number;
  };
}

interface DashboardData {
  stats: DashboardStats;
  recentData: {
    users: any[];
    transactions: any[];
    positions: any[];
    investments: any[];
  };
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
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
        if (data.user.role === 'admin' || data.user.role === 'super_admin') {
          setAuthenticated(true);
          await fetchDashboardData();
        } else {
          router.push('/dashboard');
          return;
        }
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

  const fetchDashboardData = async () => {
    try {
      // Mock data for demonstration
      const mockData = {
        stats: {
          users: {
            total_users: 1250,
            active_users: 987,
            new_users_today: 45,
            new_users_week: 234
          },
          transactions: {
            total_transactions: 8456,
            total_deposits: 2560000,
            total_withdrawals: 1890000,
            transactions_today: 125
          },
          trading: {
            total_trades: 5678,
            open_positions: 234,
            total_profit: 456000,
            total_loss: 123000
          },
          investments: {
            total_investments: 345,
            active_investments: 123,
            total_invested: 1230000,
            total_returns: 567000
          }
        },
        recentData: {
          users: [
            { id: '1', username: 'john_trader', email: 'john@example.com', balance: 15000, created_at: '2024-01-15' },
            { id: '2', username: 'mary_investor', email: 'mary@example.com', balance: 25000, created_at: '2024-01-14' },
            { id: '3', username: 'alex_gold', email: 'alex@example.com', balance: 8500, created_at: '2024-01-13' }
          ],
          transactions: [
            { id: '1', username: 'john_trader', type: 'deposit', amount: 5000, status: 'completed' },
            { id: '2', username: 'mary_investor', type: 'withdrawal', amount: 2000, status: 'pending' },
            { id: '3', username: 'alex_gold', type: 'deposit', amount: 1500, status: 'completed' }
          ],
          positions: [],
          investments: []
        }
      };
      setDashboardData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      // Mock users data
      const mockUsers = [
        { id: '1', username: 'john_trader', email: 'john@example.com', balance: 15000, status: 'active', created_at: '2024-01-15' },
        { id: '2', username: 'mary_investor', email: 'mary@example.com', balance: 25000, status: 'active', created_at: '2024-01-14' },
        { id: '3', username: 'alex_gold', email: 'alex@example.com', balance: 8500, status: 'active', created_at: '2024-01-13' },
        { id: '4', username: 'sarah_trading', email: 'sarah@example.com', balance: 12000, status: 'suspended', created_at: '2024-01-12' }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      alert(`User status updated to: ${status}`);
      await fetchUsers();
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const updateUserBalance = async (userId: string, amount: number) => {
    try {
      alert(`User balance updated to: $${amount}`);
      await fetchUsers();
    } catch (error) {
      alert('Failed to update user balance');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
          <i className="ri-shield-line text-6xl text-red-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-white mb-4">Admin Access Required</h2>
          <p className="text-gray-300 mb-6">You need admin privileges to access this area</p>
          <Link href="/login" className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-md font-semibold hover:bg-yellow-400 cursor-pointer whitespace-nowrap">
            Login as Admin
          </Link>
        </div>
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
                  MMS Gold Admin
                </h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-notification-line text-gray-400 text-xl cursor-pointer hover:text-white"></i>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-settings-line text-gray-400 text-xl cursor-pointer hover:text-white"></i>
              </div>
              <button 
                onClick={() => router.push('/login')}
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
                <button
                  onClick={() => {
                    setActiveTab('users');
                    fetchUsers();
                  }}
                  className={`w-full text-left px-4 py-2 rounded-md cursor-pointer ${
                    activeTab === 'users' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <i className="ri-user-line mr-2"></i>
                  Users
                </button>
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
              <li>
                <button
                  onClick={() => setActiveTab('trading')}
                  className={`w-full text-left px-4 py-2 rounded-md cursor-pointer ${
                    activeTab === 'trading' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <i className="ri-line-chart-line mr-2"></i>
                  Trading
                </button>
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
                <button
                  onClick={() => setActiveTab('referrals')}
                  className={`w-full text-left px-4 py-2 rounded-md cursor-pointer ${
                    activeTab === 'referrals' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <i className="ri-team-line mr-2"></i>
                  Referrals
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-2 rounded-md cursor-pointer ${
                    activeTab === 'settings' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <i className="ri-settings-2-line mr-2"></i>
                  Settings
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'overview' && dashboardData && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-white text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-white">{dashboardData.stats.users.total_users}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <i className="ri-money-dollar-circle-line text-white text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-400">Total Deposits</p>
                      <p className="text-2xl font-bold text-white">${dashboardData.stats.transactions.total_deposits.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <i className="ri-line-chart-line text-white text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-400">Active Trades</p>
                      <p className="text-2xl font-bold text-white">{dashboardData.stats.trading.open_positions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                      <i className="ri-safe-line text-white text-xl"></i>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-400">Active Investments</p>
                      <p className="text-2xl font-bold text-white">{dashboardData.stats.investments.active_investments}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Users</h3>
                  <div className="space-y-4">
                    {dashboardData.recentData.users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-400">${user.balance.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recent Transactions</h3>
                  <div className="space-y-4">
                    {dashboardData.recentData.transactions.map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{transaction.username}</p>
                          <p className="text-sm text-gray-400">{transaction.type}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ${transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">{transaction.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3">Username</th>
                        <th className="text-left py-3">Email</th>
                        <th className="text-left py-3">Balance</th>
                        <th className="text-left py-3">Status</th>
                        <th className="text-left py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user: any) => (
                        <tr key={user.id} className="border-b border-gray-700">
                          <td className="py-3">{user.username}</td>
                          <td className="py-3">{user.email}</td>
                          <td className="py-3">${user.balance.toLocaleString()}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                                className="px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700 cursor-pointer"
                              >
                                {user.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                              <button
                                onClick={() => {
                                  const amount = prompt('Enter new balance:');
                                  if (amount) updateUserBalance(user.id, parseFloat(amount));
                                }}
                                className="px-3 py-1 bg-yellow-600 rounded text-xs hover:bg-yellow-700 cursor-pointer"
                              >
                                Edit Balance
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Transaction Management</h1>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400">All user transactions, deposits, withdrawals, and trading activity are monitored here. Pending transactions can be approved or rejected.</p>
              </div>
            </div>
          )}

          {activeTab === 'trading' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Trading Management</h1>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400">Monitor all trading positions, manage risk settings, and view trading performance metrics.</p>
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Investment Management</h1>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400">Manage investment plans, monitor active investments, and process matured investments automatically via cron jobs.</p>
              </div>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">Referral Management</h1>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400">Track referral networks, commission payouts, and manage referral program settings.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h1 className="text-3xl font-bold text-white mb-8">System Settings</h1>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-400">Configure platform settings, cron job schedules, and system parameters.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
