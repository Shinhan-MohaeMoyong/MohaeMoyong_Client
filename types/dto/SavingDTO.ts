export interface MonthlySavingDTO {
  week: number;
  amount: number;
  formattedAmount: string; // 포맷된 금액 (예: "50,000원")
}

export interface SavingStateDTO {
  accountNumber: string;
  balance: string; // 포맷된 잔액 (예: "1,000,000원")
  accountAlias: string;
  monthlySavings: MonthlySavingDTO[];
  achievementRate: number;
  achievementRateText: string; // 포맷된 달성률 (예: "75%")
  encouragementMessage: string; // 독려 메시지
}
