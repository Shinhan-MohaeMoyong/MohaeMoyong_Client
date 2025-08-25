export interface MonthlySavingEntity {
  week: number;
  amount: number;
}

export interface SavingStateEntity {
  accountNumber: string;
  balance: number;
  accountAlias: string;
  monthlySavings: MonthlySavingEntity[];
  achievementRate: number;
}
