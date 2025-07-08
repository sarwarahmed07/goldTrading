
import cron from 'node-cron';
import { processMaturedInvestments, processDailyInterest } from './investmentSystem';
import { updateTradingPositions } from './tradingSystem';
import { initDatabase } from './database';

let isInitialized = false;

export function initializeCronJobs() {
  if (isInitialized) {
    console.log('Cron jobs already initialized');
    return;
  }

  console.log('Initializing cron jobs...');

  // Initialize database first
  initDatabase().then(() => {
    // Process matured investments every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running matured investments cron job...');
      try {
        await processMaturedInvestments();
      } catch (error) {
        console.error('Matured investments cron job error:', error);
      }
    });

    // Process daily interest at midnight every day
    cron.schedule('0 0 * * *', async () => {
      console.log('Running daily interest cron job...');
      try {
        await processDailyInterest();
      } catch (error) {
        console.error('Daily interest cron job error:', error);
      }
    });

    // Update trading positions every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
      try {
        await updateTradingPositions();
      } catch (error) {
        console.error('Trading positions update cron job error:', error);
      }
    });

    // Process referral commissions every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Running referral commissions cron job...');
      try {
        await processReferralCommissions();
      } catch (error) {
        console.error('Referral commissions cron job error:', error);
      }
    });

    console.log('All cron jobs initialized successfully');
    isInitialized = true;
  }).catch(error => {
    console.error('Failed to initialize database for cron jobs:', error);
  });
}

// Process pending referral commissions
async function processReferralCommissions(): Promise<void> {
  try {
    const { executeQuery } = await import('./database');
    const { updateUserBalance } = await import('./auth');

    console.log('Processing referral commissions...');
    
    const pendingCommissions = await executeQuery(`
      SELECT * FROM referral_commissions 
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT 100
    `) as any[];

    for (const commission of pendingCommissions) {
      // Add commission to user balance
      await updateUserBalance(commission.to_user_id, parseFloat(commission.amount), 'add');

      // Mark commission as paid
      await executeQuery(`
        UPDATE referral_commissions SET status = 'paid', paid_at = NOW() WHERE id = ?
      `, [commission.id]);

      // Record transaction
      const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      await executeQuery(`
        INSERT INTO transactions (id, user_id, type, amount, status, description)
        VALUES (?, ?, 'commission', ?, 'completed', ?)
      `, [
        transactionId,
        commission.to_user_id,
        parseFloat(commission.amount),
        `Level ${commission.level} referral commission`
      ]);

      console.log(`Paid commission ${commission.id} to user ${commission.to_user_id}`);
    }

    console.log(`Processed ${pendingCommissions.length} referral commissions`);
  } catch (error) {
    console.error('Process referral commissions error:', error);
  }
}

// Manual function to run all cron jobs immediately (for testing)
export async function runAllCronJobs(): Promise<void> {
  console.log('Running all cron jobs manually...');
  
  try {
    await processMaturedInvestments();
    await processDailyInterest();
    await updateTradingPositions();
    await processReferralCommissions();
    console.log('All cron jobs completed successfully');
  } catch (error) {
    console.error('Manual cron jobs execution error:', error);
  }
}

// Start cron jobs when this module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  setTimeout(() => {
    initializeCronJobs();
  }, 1000);
}
