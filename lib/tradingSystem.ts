
import { executeQuery } from './database';
import { updateUserBalance } from './auth';

export interface TradingPosition {
  id: string;
  userId: string;
  instrument: string;
  type: 'buy' | 'sell';
  amount: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: number;
  profit: number;
  status: 'open' | 'closed';
  openedAt: Date;
  closedAt?: Date;
}

export interface CreatePositionData {
  instrument: string;
  type: 'buy' | 'sell';
  amount: number;
  leverage: number;
  stopLoss?: number;
  takeProfit?: number;
}

export async function createTradingPosition(
  userId: string, 
  positionData: CreatePositionData
): Promise<{ success: boolean; position?: TradingPosition; error?: string }> {
  try {
    const { instrument, type, amount, leverage, stopLoss, takeProfit } = positionData;

    // Validate minimum trade amount
    if (amount < 10) {
      return { success: false, error: 'Minimum trade amount is $10' };
    }

    // Check user balance
    const userResult = await executeQuery(
      'SELECT balance FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (userResult.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const userBalance = parseFloat(userResult[0].balance);
    const marginRequired = amount / leverage;

    if (userBalance < marginRequired) {
      return { success: false, error: 'Insufficient balance for margin requirement' };
    }

    // Get current market price
    const currentPrice = getCurrentPrice(instrument);
    const openPrice = type === 'buy' ? currentPrice + 0.5 : currentPrice - 0.5; // Add spread

    // Create trading position
    const positionId = 'pos_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const openedAt = new Date();

    await executeQuery(`
      INSERT INTO trading_positions (id, user_id, instrument, type, amount, open_price, current_price, stop_loss, take_profit, leverage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      positionId,
      userId,
      instrument,
      type,
      amount,
      openPrice,
      currentPrice,
      stopLoss || null,
      takeProfit || null,
      leverage
    ]);

    // Deduct margin from user balance
    await updateUserBalance(userId, marginRequired, 'subtract');

    // Record transaction
    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await executeQuery(`
      INSERT INTO transactions (id, user_id, type, amount, status, description)
      VALUES (?, ?, 'trade', ?, 'completed', ?)
    `, [
      transactionId,
      userId,
      marginRequired,
      `${type.toUpperCase()} ${instrument} - Margin`
    ]);

    const position: TradingPosition = {
      id: positionId,
      userId,
      instrument,
      type,
      amount,
      openPrice,
      currentPrice,
      stopLoss,
      takeProfit,
      leverage,
      profit: 0,
      status: 'open',
      openedAt
    };

    return { success: true, position };
  } catch (error) {
    console.error('Create trading position error:', error);
    return { success: false, error: 'Failed to create trading position' };
  }
}

export async function getUserTradingPositions(userId: string): Promise<TradingPosition[]> {
  try {
    const positions = await executeQuery(`
      SELECT * FROM trading_positions WHERE user_id = ? ORDER BY opened_at DESC
    `, [userId]) as any[];

    return positions.map(pos => {
      const currentPrice = getCurrentPrice(pos.instrument);
      const profit = calculateProfit(pos, currentPrice);

      return {
        id: pos.id,
        userId: pos.user_id,
        instrument: pos.instrument,
        type: pos.type,
        amount: parseFloat(pos.amount),
        openPrice: parseFloat(pos.open_price),
        currentPrice,
        stopLoss: pos.stop_loss ? parseFloat(pos.stop_loss) : undefined,
        takeProfit: pos.take_profit ? parseFloat(pos.take_profit) : undefined,
        leverage: pos.leverage,
        profit,
        status: pos.status,
        openedAt: pos.opened_at,
        closedAt: pos.closed_at
      };
    });
  } catch (error) {
    console.error('Get user trading positions error:', error);
    return [];
  }
}

export async function closeTradingPosition(
  userId: string, 
  positionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const positions = await executeQuery(`
      SELECT * FROM trading_positions WHERE id = ? AND user_id = ? AND status = 'open'
    `, [positionId, userId]) as any[];

    if (positions.length === 0) {
      return { success: false, error: 'Position not found or already closed' };
    }

    const position = positions[0];
    const currentPrice = getCurrentPrice(position.instrument);
    const profit = calculateProfit(position, currentPrice);
    const closedAt = new Date();

    // Update position status
    await executeQuery(`
      UPDATE trading_positions SET status = 'closed', current_price = ?, profit = ?, closed_at = ?
      WHERE id = ?
    `, [currentPrice, profit, closedAt, positionId]);

    // Calculate total return (margin + profit)
    const marginUsed = parseFloat(position.amount) / position.leverage;
    const totalReturn = marginUsed + profit;

    // Add return to user balance
    await updateUserBalance(userId, totalReturn, 'add');

    // Record transaction
    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await executeQuery(`
      INSERT INTO transactions (id, user_id, type, amount, status, description)
      VALUES (?, ?, 'trade', ?, 'completed', ?)
    `, [
      transactionId,
      userId,
      totalReturn,
      `Closed ${position.type.toUpperCase()} ${position.instrument} - P&L: $${profit.toFixed(2)}`
    ]);

    return { success: true };
  } catch (error) {
    console.error('Close trading position error:', error);
    return { success: false, error: 'Failed to close trading position' };
  }
}

function getCurrentPrice(instrument: string): number {
  // Simulate real-time prices
  const basePrices: { [key: string]: number } = {
    'XAUUSD': 2385.50,
    'XAGUSD': 31.25,
    'BTCUSD': 67500.00,
    'ETHUSD': 3850.00
  };

  const basePrice = basePrices[instrument] || 2385.50;
  const volatility = 0.001; // 0.1% volatility
  const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
  
  return Math.max(basePrice + change, basePrice * 0.95);
}

function calculateProfit(position: any, currentPrice: number): number {
  const openPrice = parseFloat(position.open_price);
  const amount = parseFloat(position.amount);
  const leverage = position.leverage;

  const priceDiff = position.type === 'buy' 
    ? currentPrice - openPrice
    : openPrice - currentPrice;
  
  const profitPerUnit = priceDiff * leverage;
  return (profitPerUnit / openPrice) * amount;
}

// Cron job to update position profits and handle stop loss/take profit
export async function updateTradingPositions(): Promise<void> {
  try {
    console.log('Updating trading positions...');
    
    const openPositions = await executeQuery(`
      SELECT * FROM trading_positions WHERE status = 'open'
    `) as any[];

    for (const position of openPositions) {
      const currentPrice = getCurrentPrice(position.instrument);
      const profit = calculateProfit(position, currentPrice);

      // Update current price and profit
      await executeQuery(`
        UPDATE trading_positions SET current_price = ?, profit = ? WHERE id = ?
      `, [currentPrice, profit, position.id]);

      // Check stop loss
      if (position.stop_loss) {
        const shouldCloseStopLoss = position.type === 'buy' 
          ? currentPrice <= parseFloat(position.stop_loss)
          : currentPrice >= parseFloat(position.stop_loss);

        if (shouldCloseStopLoss) {
          await closeTradingPosition(position.user_id, position.id);
          console.log(`Closed position ${position.id} due to stop loss`);
          continue;
        }
      }

      // Check take profit
      if (position.take_profit) {
        const shouldCloseTakeProfit = position.type === 'buy'
          ? currentPrice >= parseFloat(position.take_profit)
          : currentPrice <= parseFloat(position.take_profit);

        if (shouldCloseTakeProfit) {
          await closeTradingPosition(position.user_id, position.id);
          console.log(`Closed position ${position.id} due to take profit`);
        }
      }
    }

    console.log(`Updated ${openPositions.length} trading positions`);
  } catch (error) {
    console.error('Update trading positions error:', error);
  }
}
