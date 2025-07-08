
import { executeQuery } from './database';

export interface AdminDashboardStats {
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

export async function getAdminDashboardData(): Promise<{
  stats: AdminDashboardStats;
  recentData: {
    users: any[];
    transactions: any[];
    positions: any[];
    investments: any[];
  };
}> {
  try {
    // Get user statistics
    const userStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_users_today,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_users_week
      FROM users WHERE role = 'user'
    `) as any[];

    // Get transaction statistics
    const transactionStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END) as total_withdrawals,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as transactions_today
      FROM transactions
    `) as any[];

    // Get trading statistics
    const tradingStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_positions,
        SUM(CASE WHEN profit > 0 THEN profit ELSE 0 END) as total_profit,
        SUM(CASE WHEN profit < 0 THEN ABS(profit) ELSE 0 END) as total_loss
      FROM trading_positions
    `) as any[];

    // Get investment statistics
    const investmentStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_investments,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_investments,
        SUM(amount) as total_invested,
        SUM(CASE WHEN status = 'completed' THEN total_return ELSE 0 END) as total_returns
      FROM fixed_deposits
    `) as any[];

    // Get recent users
    const recentUsers = await executeQuery(`
      SELECT id, username, email, balance, created_at, status
      FROM users 
      WHERE role = 'user'
      ORDER BY created_at DESC 
      LIMIT 10
    `) as any[];

    // Get recent transactions
    const recentTransactions = await executeQuery(`
      SELECT t.*, u.username
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `) as any[];

    // Get recent positions
    const recentPositions = await executeQuery(`
      SELECT tp.*, u.username
      FROM trading_positions tp
      JOIN users u ON tp.user_id = u.id
      ORDER BY tp.opened_at DESC
      LIMIT 10
    `) as any[];

    // Get recent investments
    const recentInvestments = await executeQuery(`
      SELECT fd.*, u.username
      FROM fixed_deposits fd
      JOIN users u ON fd.user_id = u.id
      ORDER BY fd.start_date DESC
      LIMIT 10
    `) as any[];

    const stats: AdminDashboardStats = {
      users: {
        total_users: userStats[0]?.total_users || 0,
        active_users: userStats[0]?.active_users || 0,
        new_users_today: userStats[0]?.new_users_today || 0,
        new_users_week: userStats[0]?.new_users_week || 0
      },
      transactions: {
        total_transactions: transactionStats[0]?.total_transactions || 0,
        total_deposits: parseFloat(transactionStats[0]?.total_deposits || '0'),
        total_withdrawals: parseFloat(transactionStats[0]?.total_withdrawals || '0'),
        transactions_today: transactionStats[0]?.transactions_today || 0
      },
      trading: {
        total_trades: tradingStats[0]?.total_trades || 0,
        open_positions: tradingStats[0]?.open_positions || 0,
        total_profit: parseFloat(tradingStats[0]?.total_profit || '0'),
        total_loss: parseFloat(tradingStats[0]?.total_loss || '0')
      },
      investments: {
        total_investments: investmentStats[0]?.total_investments || 0,
        active_investments: investmentStats[0]?.active_investments || 0,
        total_invested: parseFloat(investmentStats[0]?.total_invested || '0'),
        total_returns: parseFloat(investmentStats[0]?.total_returns || '0')
      }
    };

    return {
      stats,
      recentData: {
        users: recentUsers,
        transactions: recentTransactions,
        positions: recentPositions,
        investments: recentInvestments
      }
    };
  } catch (error) {
    console.error('Get admin dashboard data error:', error);
    throw error;
  }
}

export async function getAllUsers(): Promise<any[]> {
  try {
    const users = await executeQuery(`
      SELECT 
        id, username, email, first_name, last_name, balance, 
        referral_code, role, status, created_at, updated_at
      FROM users 
      WHERE role = 'user'
      ORDER BY created_at DESC
    `) as any[];

    return users;
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
}

export async function updateUserStatus(
  userId: string, 
  status: 'active' | 'inactive' | 'suspended'
): Promise<{ success: boolean; error?: string }> {
  try {
    await executeQuery(`
      UPDATE users SET status = ? WHERE id = ?
    `, [status, userId]);

    return { success: true };
  } catch (error) {
    console.error('Update user status error:', error);
    return { success: false, error: 'Failed to update user status' };
  }
}

export async function updateUserBalance(
  userId: string, 
  amount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await executeQuery(`
      UPDATE users SET balance = ? WHERE id = ?
    `, [amount, userId]);

    // Record transaction
    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await executeQuery(`
      INSERT INTO transactions (id, user_id, type, amount, status, description)
      VALUES (?, ?, 'bonus', ?, 'completed', 'Admin balance adjustment')
    `, [transactionId, userId, amount]);

    return { success: true };
  } catch (error) {
    console.error('Update user balance error:', error);
    return { success: false, error: 'Failed to update user balance' };
  }
}

export async function getAllTransactions(): Promise<any[]> {
  try {
    const transactions = await executeQuery(`
      SELECT t.*, u.username
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `) as any[];

    return transactions;
  } catch (error) {
    console.error('Get all transactions error:', error);
    return [];
  }
}

export async function getAllTradingPositions(): Promise<any[]> {
  try {
    const positions = await executeQuery(`
      SELECT tp.*, u.username
      FROM trading_positions tp
      JOIN users u ON tp.user_id = u.id
      ORDER BY tp.opened_at DESC
    `) as any[];

    return positions;
  } catch (error) {
    console.error('Get all trading positions error:', error);
    return [];
  }
}

export async function getAllInvestments(): Promise<any[]> {
  try {
    const investments = await executeQuery(`
      SELECT fd.*, u.username
      FROM fixed_deposits fd
      JOIN users u ON fd.user_id = u.id
      ORDER BY fd.start_date DESC
    `) as any[];

    return investments;
  } catch (error) {
    console.error('Get all investments error:', error);
    return [];
  }
}

export async function logAdminAction(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: any,
  ipAddress?: string
): Promise<void> {
  try {
    const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    await executeQuery(`
      INSERT INTO admin_logs (id, admin_id, action, target_type, target_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      logId,
      adminId,
      action,
      targetType || null,
      targetId || null,
      details ? JSON.stringify(details) : null,
      ipAddress || null
    ]);
  } catch (error) {
    console.error('Log admin action error:', error);
  }
}
