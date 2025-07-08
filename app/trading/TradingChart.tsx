
'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TradingChartProps {
  goldPrice: number;
}

export default function TradingChart({ goldPrice }: TradingChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const newDataPoint = {
      time: new Date().toLocaleTimeString(),
      price: goldPrice,
      timestamp: Date.now()
    };

    setChartData(prev => {
      const updated = [...prev, newDataPoint];
      return updated.slice(-50); // Keep last 50 points
    });
  }, [goldPrice]);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">XAUUSD</h2>
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-yellow-400">${goldPrice.toFixed(2)}</span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer">1M</button>
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 cursor-pointer">5M</button>
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 cursor-pointer">15M</button>
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 cursor-pointer">1H</button>
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 cursor-pointer">1D</button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-white text-sm">Live</span>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#EAB308" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trading Tools */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 cursor-pointer whitespace-nowrap">
          <i className="ri-pencil-ruler-2-line mr-2"></i>
          Draw
        </button>
        <button className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 cursor-pointer whitespace-nowrap">
          <i className="ri-calculator-line mr-2"></i>
          Calculator
        </button>
        <button className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 cursor-pointer whitespace-nowrap">
          <i className="ri-settings-3-line mr-2"></i>
          Settings
        </button>
      </div>
    </div>
  );
}
