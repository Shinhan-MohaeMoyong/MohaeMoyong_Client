import { AccountDTO } from '../types/dto/AccountDTO';
import { AccountEntity } from '../types/entity/AccountEntity';

// 기존 Account 타입 (호환성을 위해)
interface LegacyAccount {
  id: string;
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
}

// API 응답 타입
interface ApiAccountResponse {
  id: string;
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
  bankLogo: string;
  createdAt: string;
  updatedAt: string;
}

// Entity를 DTO로 변환하는 매퍼 함수들
export class AccountMapper {
  /**
   * API 응답을 AccountEntity로 변환
   */
  static fromApiResponse(apiAccount: ApiAccountResponse): AccountEntity {
    return {
      id: apiAccount.id,
      accountNumber: apiAccount.accountNumber,
      balance: apiAccount.balance,
      accountAlias: apiAccount.accountAlias,
      bankName: apiAccount.bankName,
      bankLogo: apiAccount.bankLogo,
      createdAt: apiAccount.createdAt,
      updatedAt: apiAccount.updatedAt,
    };
  }

  /**
   * API 응답 배열을 AccountEntity 배열로 변환
   */
  static fromApiResponseList(apiAccounts: ApiAccountResponse[]): AccountEntity[] {
    return apiAccounts.map(account => this.fromApiResponse(account));
  }

  /**
   * AccountEntity를 AccountDTO로 변환
   */
  static toDTO(entity: AccountEntity): AccountDTO {
    // 잔액 포맷팅
    const formattedBalance = new Intl.NumberFormat('ko-KR').format(entity.balance) + '원';
    
    // 계좌번호 마스킹
    const maskedAccountNumber = this.maskAccountNumber(entity.accountNumber);
    
    // 최근 생성된 계좌인지 확인 (7일 이내)
    const createdAt = new Date(entity.createdAt);
    const isNew = this.isNewAccount(createdAt);

    return {
      id: entity.id,
      accountNumber: entity.accountNumber,
      balance: formattedBalance,
      accountAlias: entity.accountAlias,
      bankName: entity.bankName,
      bankLogo: entity.bankLogo,
      maskedAccountNumber,
      isNew,
      createdAt,
    };
  }

  /**
   * AccountEntity 배열을 AccountDTO 배열로 변환
   */
  static toDTOList(entities: AccountEntity[]): AccountDTO[] {
    return entities.map(entity => this.toDTO(entity));
  }

  /**
   * 기존 Account 타입을 AccountDTO로 변환 (호환성)
   */
  static fromLegacyAccount(account: LegacyAccount): AccountDTO {
    return {
      id: account.id,
      accountNumber: account.accountNumber,
      balance: new Intl.NumberFormat('ko-KR').format(account.balance) + '원',
      accountAlias: account.accountAlias,
      bankName: account.bankName,
      bankLogo: account.bankName,
      maskedAccountNumber: this.maskAccountNumber(account.accountNumber),
      isNew: false, // 기존 데이터는 모두 false
      createdAt: new Date(),
    };
  }

  /**
   * 기존 Account 배열을 AccountDTO 배열로 변환 (호환성)
   */
  static fromLegacyAccountList(accounts: LegacyAccount[]): AccountDTO[] {
    return accounts.map(account => this.fromLegacyAccount(account));
  }

  /**
   * 계좌번호 마스킹 처리
   */
  private static maskAccountNumber(accountNumber: string): string {
    // 000-000-0000-000 형식에서 중간 부분을 ***로 마스킹
    return accountNumber.replace(/(\d{3})-(\d{3})-(\d{6})/, '$1-***-$3');
  }

  /**
   * 최근 생성된 계좌인지 확인 (7일 이내)
   */
  private static isNewAccount(createdAt: Date): boolean {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdAt > sevenDaysAgo;
  }
}
