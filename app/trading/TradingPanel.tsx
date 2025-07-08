
'use client';

import { useState } from 'react';

interface Position {
  id: string;
  type: string;
  amount: number;
  price: number;
  profit: number;
  status: string;
}

interface TradingPanelProps {
  goldPrice: number;
  balance: number;
  setBalance: (balance: number) => void;
  positions: Position[];
  setPositions: (positions: Position[]) => void;
  onTrade: (type: 'buy' | 'sell', amount: number, leverage: number) => void;
  onClosePosition: (positionId: string) => void;
}

export default function TradingPanel({ 
  goldPrice, 
  balance, 
  setBalance, 
  positions, 
  setPositions,
  onTrade,
  onClosePosition
}: TradingPanelProps) {
  const [tradeAmount, setTradeAmount] = useState(100);
  const [leverage, setLeverage] = useState(100);
  const [activeTab, setActiveTab] = useState('trade');

  const handleTrade = (type: 'buy' | 'sell') => {
    if (tradeAmount > balance) {
      alert('Insufficient balance');
      return;
    }

    if (tradeAmount < 10) {
      alert('Minimum trade amount is $10');
      return;
    }

    onTrade(type, tradeAmount, leverage);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Account Info */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">${balance.toLocaleString()}</div>
          <div className="text-sm text-gray-300">Account Balance</div>
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <div>
            <div className="text-gray-300">Equity</div>
            <div className="text-white font-semibold">${(balance + 150).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-300">Margin</div>
            <div className="text-white font-semibold">$2,450</div>
          </div>
          <div>
            <div className="text-gray-300">Free Margin</div>
            <div className="text-white font-semibold">$7,700</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-4">
        <button 
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg ${
            activeTab === 'trade' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          } cursor-pointer`}
          onClick={() => setActiveTab('trade')}
        >
          Trade
        </button>
        <button 
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg ${
            activeTab === 'positions' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          } cursor-pointer`}
          onClick={() => setActiveTab('positions')}
        >
          Positions
        </button>
      </div>

      {activeTab === 'trade' ? (
        <div className="flex-1">
          {/* Current Price */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-400">${goldPrice.toFixed(2)}</div>
              <div className="text-sm text-gray-300">XAUUSD</div>
            </div>
          </div>

          {/* Trade Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Amount ($)</label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(Number(e.target.value))}
                min="10"
                max={balance}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">Leverage</label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm pr-8"
              >
                <option value={50}>1:50</option>
                <option value={100}>1:100</option>
                <option value={200}>1:200</option>
                <option value={500}>1:500</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTrade('buy')}
                className="bg-green-600 text-white py-3 px-4 rounded font-semibold hover:bg-green-700 cursor-pointer whitespace-nowrap"
              >
                BUY
              </button>
              <button
                onClick={() => handleTrade('sell')}
                className="bg-red-600 text-white py-3 px-4 rounded font-semibold hover:bg-red-700 cursor-pointer whitespace-nowrap"
              >
                SELL
              </button>
            </div>
          </div>

          {/* Quick Trade Amounts */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="text-sm text-gray-300 mb-2">Quick Trade</div>
            <div className="grid grid-cols-3 gap-2">
              {[100, 500, 1000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setTradeAmount(amount)}
                  className="py-1 px-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 cursor-pointer"
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1">
          {/* Positions List */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4">Open Positions</h3>
            <div className="space-y-3">
              {positions.map(position => (
                <div key={position.id} className="bg-gray-700/50 rounded p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className={`text-sm font-semibold ${
                        position.type === 'buy' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {position.type.toUpperCase()} XAUUSD
                      </div>
                      <div className="text-xs text-gray-300">
                        Amount: ${position.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-300">
                        Price: ${position.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        position.profit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${position.profit.toFixed(2)}
                      </div>
                      {position.status === 'open' && (
                        <button
                          onClick={() => onClosePosition(position.id)}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded mt-1 hover:bg-red-700 cursor-pointer"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {positions.length === 0 && (
                <div className="text-gray-400 text-center py-4">
                  No open positions
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
