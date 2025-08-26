export interface TransactionDetailDTO {
  transactionDate: string;      // 거래일자 (YYYYMMDD)
  transactionTime: string;      // 거래시각 (HHMMSS)
  transactionType: string;      // 1: 입금, 2: 출금
  transactionTypeName: string;  // 입금, 출금, 입금(이체), 출금(이체)
  transactionBalance: number;   // 거래금액
  transactionAfterBalance: number; // 거래후잔액
  transactionSummary: string;   // 거래 메모 (일정제목과 동일)
}

export interface AccountDetailDTO {
  accountNo: string;           // 계좌 번호
  accountBalance: number;      // 계좌 잔액
  accountName: string;         // 계좌 별칭
  list: TransactionDetailDTO[]; // 거래목록
}
