
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.user.role === 'admin' || data.user.role === 'super_admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
      <div className="absolute inset-0">
        <img 
          src="https://readdy.ai/api/search-image?query=Luxurious%20gold%20trading%20login%20background%20with%20golden%20geometric%20patterns%2C%20professional%20financial%20technology%20interface%2C%20modern%20digital%20investment%20concept%20with%20security%20elements%2C%20dark%20blue%20gradient%20with%20golden%20accents&width=1400&height=800&seq=login-bg&orientation=landscape"
          alt="Login Background"
          className="w-full h-full object-cover object-top opacity-20"
        />
      </div>

      <div className="relative max-w-md w-full space-y-8 p-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
          <div className="text-center mb-8">
            <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <i className="ri-copper-coin-line text-white text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold text-yellow-400" style={{fontFamily: 'var(--font-pacifico)'}}>
                MMS Gold
              </h1>
            </Link>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-blue-200">Sign in to your trading account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter your username or email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-gray-600 rounded bg-gray-700"
                />
                <label className="ml-2 block text-sm text-blue-200">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-yellow-400 hover:text-yellow-300 cursor-pointer">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-blue-900 py-3 px-4 rounded-md font-semibold hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-blue-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-blue-200">
              Don't have an account?{' '}
              <Link href="/register" className="text-yellow-400 hover:text-yellow-300 font-medium cursor-pointer">
                Sign up now
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="text-center">
              <p className="text-sm text-blue-300 mb-4">Or continue with</p>
              <div className="flex justify-center space-x-4">
                <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 cursor-pointer">
                  <i className="ri-facebook-fill text-white"></i>
                </button>
                <button className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 cursor-pointer">
                  <i className="ri-google-fill text-white"></i>
                </button>
                <button className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <i className="ri-apple-fill text-white"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-blue-300 text-sm">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-yellow-400 hover:text-yellow-300 cursor-pointer">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-yellow-400 hover:text-yellow-300 cursor-pointer">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
