
// Trading API configurations and utilities
export const TRADING_CONFIG = {
  API_BASE_URL: 'https://api.mmsgold.com',
  WEBSOCKET_URL: 'wss://ws.mmsgold.com',
  DEFAULT_LEVERAGE: 100,
  MIN_TRADE_AMOUNT: 10,
  MAX_TRADE_AMOUNT: 100000,
  SUPPORTED_INSTRUMENTS: ['XAUUSD', 'XAGUSD', 'BTCUSD', 'ETHUSD'],
};

export interface TradePosition {
  id: string;
  instrument: string;
  type: 'buy' | 'sell';
  amount: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  timestamp: number;
  status: 'open' | 'closed';
}

export interface MarketData {
  instrument: string;
  bid: number;
  ask: number;
  spread: number;
  timestamp: number;
}

export class TradingAPI {
  private apiKey: string;
  private userId: string;

  constructor(apiKey: string, userId: string) {
    this.apiKey = apiKey;
    this.userId = userId;
  }

  // Simulate real-time price updates
  generateMockPrice(basePrice: number): number {
    const volatility = 0.001; // 0.1% volatility
    const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
    return Math.max(basePrice + change, basePrice * 0.95); // Prevent negative prices
  }

  // Get current market data
  async getMarketData(instrument: string): Promise<MarketData> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const basePrice = this.getBasePrice(instrument);
    const spread = this.getSpread(instrument);
    
    return {
      instrument,
      bid: this.generateMockPrice(basePrice) - spread / 2,
      ask: this.generateMockPrice(basePrice) + spread / 2,
      spread,
      timestamp: Date.now()
    };
  }

  // Place a trade order
  async placeTrade(instrument: string, type: 'buy' | 'sell', amount: number): Promise<TradePosition> {
    const marketData = await this.getMarketData(instrument);
    const openPrice = type === 'buy' ? marketData.ask : marketData.bid;

    const position: TradePosition = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      instrument,
      type,
      amount,
      openPrice,
      currentPrice: openPrice,
      profit: 0,
      timestamp: Date.now(),
      status: 'open'
    };

    return position;
  }

  // Close a trade position
  async closeTrade(positionId: string, positions: TradePosition[]): Promise<TradePosition | null> {
    const position = positions.find(p => p.id === positionId);
    if (!position) return null;

    const marketData = await this.getMarketData(position.instrument);
    const closePrice = position.type === 'buy' ? marketData.bid : marketData.ask;
    
    const profit = this.calculateProfit(position, closePrice);

    return {
      ...position,
      currentPrice: closePrice,
      profit,
      status: 'closed'
    };
  }

  // Calculate profit for a position
  calculateProfit(position: TradePosition, currentPrice: number): number {
    const priceDiff = position.type === 'buy' 
      ? currentPrice - position.openPrice
      : position.openPrice - currentPrice;
    
    return priceDiff * position.amount;
  }

  // Get base price for different instruments
  private getBasePrice(instrument: string): number {
    const basePrices: { [key: string]: number } = {
      'XAUUSD': 2385.50,
      'XAGUSD': 31.25,
      'BTCUSD': 67500.00,
      'ETHUSD': 3850.00
    };
    return basePrices[instrument] || 2385.50;
  }

  // Get spread for different instruments
  private getSpread(instrument: string): number {
    const spreads: { [key: string]: number } = {
      'XAUUSD': 0.50,
      'XAGUSD': 0.05,
      'BTCUSD': 50.00,
      'ETHUSD': 5.00
    };
    return spreads[instrument] || 0.50;
  }

  // Generate historical data for charts
  generateHistoricalData(instrument: string, periods: number): Array<{time: string, price: number, volume: number}> {
    const basePrice = this.getBasePrice(instrument);
    const data = [];
    let currentPrice = basePrice;

    for (let i = periods; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60000).toLocaleTimeString();
      currentPrice = this.generateMockPrice(currentPrice);
      const volume = Math.floor(Math.random() * 1000) + 100;
      
      data.push({
        time,
        price: currentPrice,
        volume
      });
    }

    return data;
  }
}

// Risk management utilities
export class RiskManager {
  static calculatePositionSize(
    accountBalance: number,
    riskPercentage: number,
    stopLoss: number,
    entryPrice: number
  ): number {
    const riskAmount = accountBalance * (riskPercentage / 100);
    const priceRisk = Math.abs(entryPrice - stopLoss);
    return Math.floor(riskAmount / priceRisk * 100) / 100;
  }

  static calculateMarginRequired(
    positionSize: number,
    price: number,
    leverage: number
  ): number {
    return (positionSize * price) / leverage;
  }

  static validateTrade(
    amount: number,
    balance: number,
    leverage: number,
    price: number
  ): { valid: boolean; error?: string } {
    if (amount < TRADING_CONFIG.MIN_TRADE_AMOUNT) {
      return { valid: false, error: `Minimum trade amount is $${TRADING_CONFIG.MIN_TRADE_AMOUNT}` };
    }

    if (amount > TRADING_CONFIG.MAX_TRADE_AMOUNT) {
      return { valid: false, error: `Maximum trade amount is $${TRADING_CONFIG.MAX_TRADE_AMOUNT}` };
    }

    const marginRequired = this.calculateMarginRequired(amount / price, price, leverage);
    if (marginRequired > balance * 0.5) {
      return { valid: false, error: 'Insufficient margin. Reduce position size or increase leverage.' };
    }

    return { valid: true };
  }
}

// Market analysis utilities
export class MarketAnalysis {
  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    
    return 100 - (100 / (1 + rs));
  }

  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  static getTradingSignal(currentPrice: number, sma: number, rsi: number): string {
    if (rsi > 70 && currentPrice > sma) return 'STRONG_SELL';
    if (rsi > 70) return 'SELL';
    if (rsi < 30 && currentPrice < sma) return 'STRONG_BUY';
    if (rsi < 30) return 'BUY';
    if (currentPrice > sma) return 'BULLISH';
    if (currentPrice < sma) return 'BEARISH';
    return 'NEUTRAL';
  }
}
