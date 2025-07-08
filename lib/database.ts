
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mms_gold_trading',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

export const pool = mysql.createPool(dbConfig);

export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        phone VARCHAR(20),
        country VARCHAR(50),
        balance DECIMAL(15,2) DEFAULT 0.00,
        referral_code VARCHAR(50) UNIQUE,
        referred_by VARCHAR(36),
        role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        email_verified BOOLEAN DEFAULT FALSE,
        kyc_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create Trading Positions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trading_positions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        instrument VARCHAR(20) NOT NULL,
        type ENUM('buy', 'sell') NOT NULL,
        amount DECIMAL(15,4) NOT NULL,
        open_price DECIMAL(15,4) NOT NULL,
        current_price DECIMAL(15,4),
        stop_loss DECIMAL(15,4),
        take_profit DECIMAL(15,4),
        leverage INT DEFAULT 100,
        profit DECIMAL(15,2) DEFAULT 0.00,
        status ENUM('open', 'closed') DEFAULT 'open',
        opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        closed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Transactions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        type ENUM('deposit', 'withdrawal', 'trade', 'commission', 'bonus') NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        fee DECIMAL(15,2) DEFAULT 0.00,
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50),
        transaction_hash VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Referral Commissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS referral_commissions (
        id VARCHAR(36) PRIMARY KEY,
        from_user_id VARCHAR(36) NOT NULL,
        to_user_id VARCHAR(36) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        percentage DECIMAL(5,4) NOT NULL,
        level INT NOT NULL,
        type ENUM('trading', 'deposit', 'bonus') NOT NULL,
        status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL,
        FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Fixed Deposits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS fixed_deposits (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        plan_name VARCHAR(50) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        daily_rate DECIMAL(5,4) NOT NULL,
        duration_days INT NOT NULL,
        total_return DECIMAL(15,2),
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        last_payout TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Admin Logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id VARCHAR(36) PRIMARY KEY,
        admin_id VARCHAR(36) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id VARCHAR(36),
        details JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Market Data table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS market_data (
        id VARCHAR(36) PRIMARY KEY,
        instrument VARCHAR(20) NOT NULL,
        bid DECIMAL(15,4) NOT NULL,
        ask DECIMAL(15,4) NOT NULL,
        spread DECIMAL(15,4) NOT NULL,
        volume BIGINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_instrument_time (instrument, created_at)
      )
    `);

    // Create Settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(36) PRIMARY KEY,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        description TEXT,
        updated_by VARCHAR(36),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Insert default settings
    await connection.execute(`
      INSERT IGNORE INTO settings (id, key_name, value, type, description) VALUES
      (UUID(), 'site_name', 'MMS Gold Trading', 'string', 'Website name'),
      (UUID(), 'min_deposit', '10', 'number', 'Minimum deposit amount'),
      (UUID(), 'max_deposit', '100000', 'number', 'Maximum deposit amount'),
      (UUID(), 'min_withdrawal', '5', 'number', 'Minimum withdrawal amount'),
      (UUID(), 'withdrawal_fee', '2.5', 'number', 'Withdrawal fee percentage'),
      (UUID(), 'referral_level1', '15', 'number', 'Level 1 referral commission %'),
      (UUID(), 'referral_level2', '10', 'number', 'Level 2 referral commission %'),
      (UUID(), 'referral_level3', '5', 'number', 'Level 3 referral commission %'),
      (UUID(), 'trading_enabled', 'true', 'boolean', 'Enable/disable trading'),
      (UUID(), 'maintenance_mode', 'false', 'boolean', 'Maintenance mode status')
    `);

    // Create default admin user
    const bcrypt = require('bcryptjs');
    const adminId = 'admin-' + Date.now();
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await connection.execute(`
      INSERT IGNORE INTO users (id, username, email, password_hash, first_name, last_name, role, status, email_verified, referral_code) 
      VALUES (?, 'admin', 'admin@mmsgold.com', ?, 'System', 'Administrator', 'super_admin', 'active', TRUE, 'ADMIN-001')
    `, [adminId, hashedPassword]);

    connection.release();
    console.log('Database initialized successfully');
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getConnection() {
  return await pool.getConnection();
}
