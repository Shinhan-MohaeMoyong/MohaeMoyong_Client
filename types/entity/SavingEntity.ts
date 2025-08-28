export interface MonthlySavingEntity {
  week: number;
  amount: number;
}

export interface SavingStateEntity {
  accountNumber: string;
  balance: number;
  accountAlias: string;
  targetAmount: number; // 목표 금액
  monthlySavings: MonthlySavingEntity[];
  achievementRate: number;
}
