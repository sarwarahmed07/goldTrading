
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'mms-gold-secret-key-2024';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  balance: number;
  referralCode: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    return null;
  }
}

export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  referralCode?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [userData.username, userData.email]
    ) as any[];

    if (existingUser.length > 0) {
      return { success: false, error: 'Username or email already exists' };
    }

    // Validate referral code if provided
    let referredBy = null;
    if (userData.referralCode) {
      const referrer = await executeQuery(
        'SELECT id FROM users WHERE referral_code = ? AND status = "active"',
        [userData.referralCode]
      ) as any[];

      if (referrer.length === 0) {
        return { success: false, error: 'Invalid referral code' };
      }
      referredBy = referrer[0].id;
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);
    
    // Generate unique referral code
    const newReferralCode = generateReferralCode(userData.username);
    const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // Insert new user
    await executeQuery(`
      INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, country, referral_code, referred_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      userData.username,
      userData.email,
      hashedPassword,
      userData.firstName || '',
      userData.lastName || '',
      userData.phone || '',
      userData.country || '',
      newReferralCode,
      referredBy
    ]);

    // Get created user
    const newUser = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    ) as any[];

    const user = mapDbUserToUser(newUser[0]);
    
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

export async function loginUser(username: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    const users = await executeQuery(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    ) as any[];

    if (users.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const dbUser = users[0];
    
    if (dbUser.status !== 'active') {
      return { success: false, error: 'Account is suspended or inactive' };
    }

    const isValidPassword = await verifyPassword(password, dbUser.password_hash);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid password' };
    }

    const user = mapDbUserToUser(dbUser);
    const token = generateToken(user.id, user.role);

    return { success: true, user, token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const users = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    ) as any[];

    if (users.length === 0) return null;
    
    return mapDbUserToUser(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

function generateReferralCode(username: string): string {
  const prefix = username.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MMS-${prefix}-${timestamp}-${random}`;
}

function mapDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    firstName: dbUser.first_name,
    lastName: dbUser.last_name,
    balance: parseFloat(dbUser.balance),
    referralCode: dbUser.referral_code,
    role: dbUser.role,
    status: dbUser.status,
    createdAt: dbUser.created_at
  };
}

export async function updateUserBalance(userId: string, amount: number, type: 'add' | 'subtract'): Promise<boolean> {
  try {
    const operation = type === 'add' ? '+' : '-';
    await executeQuery(
      `UPDATE users SET balance = balance ${operation} ? WHERE id = ?`,
      [Math.abs(amount), userId]
    );
    return true;
  } catch (error) {
    console.error('Update balance error:', error);
    return false;
  }
}
