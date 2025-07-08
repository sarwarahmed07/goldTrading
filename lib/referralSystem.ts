
// GoldGrowth Network Referral System
export interface ReferralUser {
  id: string;
  username: string;
  email: string;
  referralCode: string;
  referredBy?: string;
  joinDate: Date;
  totalEarnings: number;
  monthlyEarnings: number;
  level: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Commission {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  percentage: number;
  level: number;
  type: 'trading' | 'deposit' | 'bonus';
  timestamp: Date;
  status: 'pending' | 'paid' | 'cancelled';
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissions: number;
  monthlyCommissions: number;
  levelBreakdown: { [level: number]: number };
}

export class ReferralSystem {
  private commissionRates = {
    level1: 0.15, // 15% for direct referrals
    level2: 0.10, // 10% for second level
    level3: 0.05, // 5% for third level
    bonus: 0.02   // 2% monthly bonus for top performers
  };

  // Generate unique referral code
  generateReferralCode(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `MMS-${userId.substring(0, 4).toUpperCase()}-${timestamp}-${random}`.toUpperCase();
  }

  // Calculate commission for a trade
  calculateCommission(
    tradeAmount: number,
    referrerLevel: number,
    tradeType: 'trading' | 'deposit' | 'bonus'
  ): number {
    let rate = 0;
    
    switch (referrerLevel) {
      case 1:
        rate = this.commissionRates.level1;
        break;
      case 2:
        rate = this.commissionRates.level2;
        break;
      case 3:
        rate = this.commissionRates.level3;
        break;
      default:
        return 0;
    }

    // Apply type multiplier
    if (tradeType === 'deposit') rate *= 1.5;
    if (tradeType === 'bonus') rate = this.commissionRates.bonus;

    return tradeAmount * rate;
  }

  // Process referral chain commissions
  async processReferralCommissions(
    userId: string,
    tradeAmount: number,
    tradeType: 'trading' | 'deposit' | 'bonus',
    referralChain: ReferralUser[]
  ): Promise<Commission[]> {
    const commissions: Commission[] = [];

    for (let i = 0; i < Math.min(referralChain.length, 3); i++) {
      const referrer = referralChain[i];
      const level = i + 1;
      const amount = this.calculateCommission(tradeAmount, level, tradeType);
      const percentage = this.getCommissionRate(level);

      if (amount > 0 && referrer.status === 'active') {
        const commission: Commission = {
          id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fromUserId: userId,
          toUserId: referrer.id,
          amount,
          percentage,
          level,
          type: tradeType,
          timestamp: new Date(),
          status: 'pending'
        };

        commissions.push(commission);
      }
    }

    return commissions;
  }

  // Get commission rate by level
  private getCommissionRate(level: number): number {
    switch (level) {
      case 1: return this.commissionRates.level1;
      case 2: return this.commissionRates.level2;
      case 3: return this.commissionRates.level3;
      default: return 0;
    }
  }

  // Calculate referral statistics
  calculateReferralStats(
    userId: string,
    referrals: ReferralUser[],
    commissions: Commission[]
  ): ReferralStats {
    const directReferrals = referrals.filter(r => r.referredBy === userId);
    const activeReferrals = directReferrals.filter(r => r.status === 'active');
    
    const userCommissions = commissions.filter(c => c.toUserId === userId && c.status === 'paid');
    const totalCommissions = userCommissions.reduce((sum, c) => sum + c.amount, 0);
    
    const currentMonth = new Date().getMonth();
    const monthlyCommissions = userCommissions
      .filter(c => c.timestamp.getMonth() === currentMonth)
      .reduce((sum, c) => sum + c.amount, 0);

    const levelBreakdown = userCommissions.reduce((acc, c) => {
      acc[c.level] = (acc[c.level] || 0) + c.amount;
      return acc;
    }, {} as { [level: number]: number });

    return {
      totalReferrals: this.countAllReferrals(userId, referrals),
      activeReferrals: activeReferrals.length,
      totalCommissions,
      monthlyCommissions,
      levelBreakdown
    };
  }

  // Count all referrals in the network (including sub-referrals)
  private countAllReferrals(userId: string, allReferrals: ReferralUser[]): number {
    const directReferrals = allReferrals.filter(r => r.referredBy === userId);
    let total = directReferrals.length;

    // Count sub-referrals recursively
    for (const referral of directReferrals) {
      total += this.countAllReferrals(referral.id, allReferrals);
    }

    return total;
  }

  // Get referral chain for a user
  getReferralChain(userId: string, allUsers: ReferralUser[]): ReferralUser[] {
    const chain: ReferralUser[] = [];
    let currentUser = allUsers.find(u => u.id === userId);

    while (currentUser?.referredBy && chain.length < 3) {
      const referrer = allUsers.find(u => u.id === currentUser!.referredBy);
      if (referrer) {
        chain.push(referrer);
        currentUser = referrer;
      } else {
        break;
      }
    }

    return chain;
  }

  // Calculate monthly bonuses for top performers
  calculateMonthlyBonuses(
    referrals: ReferralUser[],
    commissions: Commission[],
    month: number
  ): { userId: string; bonusAmount: number }[] {
    const monthlyStats = new Map<string, number>();

    // Calculate monthly commission totals for each user
    commissions
      .filter(c => c.timestamp.getMonth() === month && c.status === 'paid')
      .forEach(c => {
        const current = monthlyStats.get(c.toUserId) || 0;
        monthlyStats.set(c.toUserId, current + c.amount);
      });

    // Sort by monthly earnings and award top 10%
    const sortedUsers = Array.from(monthlyStats.entries())
      .sort(([, a], [, b]) => b - a);

    const topCount = Math.max(1, Math.floor(sortedUsers.length * 0.1));
    const bonuses: { userId: string; bonusAmount: number }[] = [];

    for (let i = 0; i < topCount; i++) {
      const [userId, monthlyEarnings] = sortedUsers[i];
      const bonusAmount = monthlyEarnings * this.commissionRates.bonus;
      bonuses.push({ userId, bonusAmount });
    }

    return bonuses;
  }

  // Validate referral code
  validateReferralCode(code: string, allUsers: ReferralUser[]): ReferralUser | null {
    return allUsers.find(u => u.referralCode === code && u.status === 'active') || null;
  }

  // Generate referral link
  generateReferralLink(referralCode: string, baseUrl: string = 'https://mmsgold.com'): string {
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  // Track referral conversion
  trackConversion(
    referralCode: string,
    newUserId: string,
    conversionType: 'registration' | 'deposit' | 'trade'
  ): { success: boolean; message: string } {
    // This would integrate with analytics system
    console.log(`Referral conversion tracked: ${conversionType} for code ${referralCode} by user ${newUserId}`);
    
    return {
      success: true,
      message: `${conversionType} conversion tracked successfully`
    };
  }
}

// Mock data for development
export const mockReferralData = {
  users: [
    {
      id: 'user1',
      username: 'goldtrader1',
      email: 'trader1@example.com',
      referralCode: 'MMS-GOLD-2024-001',
      joinDate: new Date('2024-01-15'),
      totalEarnings: 18750.00,
      monthlyEarnings: 2450.00,
      level: 1,
      status: 'active' as const
    },
    {
      id: 'user2',
      username: 'investor2',
      email: 'investor2@example.com',
      referralCode: 'MMS-GOLD-2024-002',
      referredBy: 'user1',
      joinDate: new Date('2024-02-01'),
      totalEarnings: 5230.00,
      monthlyEarnings: 850.00,
      level: 2,
      status: 'active' as const
    }
  ] as ReferralUser[],

  commissions: [
    {
      id: 'comm_001',
      fromUserId: 'user2',
      toUserId: 'user1',
      amount: 150.00,
      percentage: 0.15,
      level: 1,
      type: 'trading' as const,
      timestamp: new Date(),
      status: 'paid' as const
    }
  ] as Commission[]
};
