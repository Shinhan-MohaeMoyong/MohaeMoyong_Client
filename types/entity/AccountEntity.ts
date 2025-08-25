// Account Entity - 순수한 데이터 구조
export interface AccountEntity {
  id: string;
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
  bankLogo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequestEntity {
  productId: string;
  productName: string;
  bankName: string;
  userId: string;
}

export interface CreateAccountResponseEntity {
  success: boolean;
  accountId: string;
  message?: string;
}
