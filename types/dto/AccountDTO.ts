// Account DTO - UI 표시용 데이터 구조
export interface AccountDTO {
  id: string;
  accountNumber: string;
  balance: string; // 포맷된 잔액 (예: "1,000,000원")
  accountAlias: string;
  bankName: string;
  bankLogo: string;
  maskedAccountNumber: string; // 마스킹된 계좌번호 (예: "123-***-456789")
  isNew: boolean; // 최근 생성된 계좌인지 여부
  createdAt: Date; // Date 객체로 변환
}

export interface CreateAccountRequestDTO {
  productId: string;
  productName: string;
  bankName: string;
  userId: string;
}

export interface CreateAccountResponseDTO {
  success: boolean;
  accountId: string;
  message?: string;
}
