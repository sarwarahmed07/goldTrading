
import { executeQuery } from './database';
import { updateUserBalance } from './auth';

export interface Investment {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  dailyRate: number;
  durationDays: number;
  totalReturn: number;
  status: 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  canSell: boolean;
  canRenew: boolean;
}

export interface InvestmentPlan {
  name: string;
  durationDays: number;
  dailyRate: number;
  minAmount: number;
  maxAmount: number;
  returnRate: number;
}

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    name: '3 Days Plan',
    durationDays: 3,
    dailyRate: 0.055, // 5.5% daily
    minAmount: 2000,
    maxAmount: 5000,
    returnRate: 0.165 // 16.5% total
  },
  {
    name: '6 Days Plan',
    durationDays: 6,
    dailyRate: 0.075, // 7.5% daily
    minAmount: 5000,
    maxAmount: 15000,
    returnRate: 0.45 // 45% total
  },
  {
    name: '12 Days Plan',
    durationDays: 12,
    dailyRate: 0.095, // 9.5% daily
    minAmount: 15000,
    maxAmount: 50000,
    returnRate: 1.14 // 114% total
  }
];

export async function createInvestment(
  userId: string, 
  planName: string, 
  amount: number
): Promise<{ success: boolean; investment?: Investment; error?: string }> {
  try {
    const plan = INVESTMENT_PLANS.find(p => p.name === planName);
    if (!plan) {
      return { success: false, error: 'Invalid investment plan' };
    }

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return { 
        success: false, 
        error: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` 
      };
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
    if (userBalance < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    // Create investment
    const investmentId = 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const totalReturn = amount * (1 + plan.returnRate);

    await executeQuery(`
      INSERT INTO fixed_deposits (id, user_id, plan_name, amount, daily_rate, duration_days, total_return, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      investmentId,
      userId,
      planName,
      amount,
      plan.dailyRate,
      plan.durationDays,
      totalReturn,
      startDate,
      endDate
    ]);

    // Deduct amount from user balance
    await updateUserBalance(userId, amount, 'subtract');

    // Record transaction
    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await executeQuery(`
      INSERT INTO transactions (id, user_id, type, amount, status, description)
      VALUES (?, ?, 'deposit', ?, 'completed', ?)
    `, [
      transactionId,
      userId,
      amount,
      `Investment in ${planName}`
    ]);

    const investment: Investment = {
      id: investmentId,
      userId,
      planName,
      amount,
      dailyRate: plan.dailyRate,
      durationDays: plan.durationDays,
      totalReturn,
      status: 'active',
      startDate,
      endDate,
      canSell: true,
      canRenew: false
    };

    return { success: true, investment };
  } catch (error) {
    console.error('Create investment error:', error);
    return { success: false, error: 'Failed to create investment' };
  }
}

export async function getUserInvestments(userId: string): Promise<Investment[]> {
  try {
    const investments = await executeQuery(`
      SELECT * FROM fixed_deposits WHERE user_id = ? ORDER BY start_date DESC
    `, [userId]) as any[];

    return investments.map(inv => ({
      id: inv.id,
      userId: inv.user_id,
      planName: inv.plan_name,
      amount: parseFloat(inv.amount),
      dailyRate: parseFloat(inv.daily_rate),
      durationDays: inv.duration_days,
      totalReturn: parseFloat(inv.total_return),
      status: inv.status,
      startDate: inv.start_date,
      endDate: inv.end_date,
      canSell: inv.status === 'active' && new Date() < new Date(inv.end_date),
      canRenew: inv.status === 'completed'
    }));
  } catch (error) {
    console.error('Get user investments error:', error);
    return [];
  }
}

export async function sellInvestment(
  userId: string, 
  investmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const investments = await executeQuery(`
      SELECT * FROM fixed_deposits WHERE id = ? AND user_id = ? AND status = 'active'
    `, [investmentId, userId]) as any[];

    if (investments.length === 0) {
      return { success: false, error: 'Investment not found or already completed' };
    }

    const investment = investments[0];
    const now = new Date();
    const startDate = new Date(investment.start_date);
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    // Calculate partial return (80% of earned interest + principal)
    const earnedInterest = parseFloat(investment.amount) * parseFloat(investment.daily_rate) * daysElapsed;
    const sellAmount = parseFloat(investment.amount) + (earnedInterest * 0.8);

    // Update investment status
    await executeQuery(`
      UPDATE fixed_deposits SET status = 'cancelled' WHERE id = ?
    `, [investmentId]);

    // Add amount back to user balance
    await updateUserBalance(userId, sellAmount, 'add');

    // Record transaction
    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await executeQuery(`
      INSERT INTO transactions (id, user_id, type, amount, status, description)
      VALUES (?, ?, 'withdrawal', ?, 'completed', ?)
    `, [
      transactionId,
      userId,
      sellAmount,
      `Early withdrawal from ${investment.plan_name}`
    ]);

    return { success: true };
  } catch (error) {
    console.error('Sell investment error:', error);
    return { success: false, error: 'Failed to sell investment' };
  }
}

export async function renewInvestment(
  userId: string, 
  investmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const investments = await executeQuery(`
      SELECT * FROM fixed_deposits WHERE id = ? AND user_id = ? AND status = 'completed'
    `, [investmentId, userId]) as any[];

    if (investments.length === 0) {
      return { success: false, error: 'Investment not found or not eligible for renewal' };
    }

    const oldInvestment = investments[0];
    
    // Create new investment with same terms
    const result = await createInvestment(
      userId,
      oldInvestment.plan_name,
      parseFloat(oldInvestment.total_return)
    );

    if (result.success) {
      // Mark old investment as renewed
      await executeQuery(`
        UPDATE fixed_deposits SET status = 'renewed' WHERE id = ?
      `, [investmentId]);
    }

    return result;
  } catch (error) {
    console.error('Renew investment error:', error);
    return { success: false, error: 'Failed to renew investment' };
  }
}

// Cron job function to process matured investments
export async function processMaturedInvestments(): Promise<void> {
  try {
    console.log('Processing matured investments...');
    
    const maturedInvestments = await executeQuery(`
      SELECT * FROM fixed_deposits 
      WHERE status = 'active' AND end_date <= NOW()
    `) as any[];

    for (const investment of maturedInvestments) {
      // Update investment status to completed
      await executeQuery(`
        UPDATE fixed_deposits SET status = 'completed' WHERE id = ?
      `, [investment.id]);

      // Add total return to user balance
      await updateUserBalance(investment.user_id, parseFloat(investment.total_return), 'add');

      // Record transaction
      const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await executeQuery(`
        INSERT INTO transactions (id, user_id, type, amount, status, description)
        VALUES (?, ?, 'bonus', ?, 'completed', ?)
      `, [
        transactionId,
        investment.user_id,
        parseFloat(investment.total_return),
        `Investment matured: ${investment.plan_name}`
      ]);

      console.log(`Processed investment ${investment.id} for user ${investment.user_id}`);
    }

    console.log(`Processed ${maturedInvestments.length} matured investments`);
  } catch (error) {
    console.error('Process matured investments error:', error);
  }
}

// Cron job function to process daily interest
export async function processDailyInterest(): Promise<void> {
  try {
    console.log('Processing daily interest...');
    
    const activeInvestments = await executeQuery(`
      SELECT * FROM fixed_deposits 
      WHERE status = 'active' AND start_date <= NOW() AND end_date > NOW()
    `) as any[];

    for (const investment of activeInvestments) {
      const dailyInterest = parseFloat(investment.amount) * parseFloat(investment.daily_rate);
      
      // Add daily interest to user balance
      await updateUserBalance(investment.user_id, dailyInterest, 'add');

      // Record transaction
      const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await executeQuery(`
        INSERT INTO transactions (id, user_id, type, amount, status, description)
        VALUES (?, ?, 'bonus', ?, 'completed', ?)
      `, [
        transactionId,
        investment.user_id,
        dailyInterest,
        `Daily interest from ${investment.plan_name}`
      ]);

      // Update last payout date
      await executeQuery(`
        UPDATE fixed_deposits SET last_payout = NOW() WHERE id = ?
      `, [investment.id]);
    }

    console.log(`Processed daily interest for ${activeInvestments.length} investments`);
  } catch (error) {
    console.error('Process daily interest error:', error);
  }
}
