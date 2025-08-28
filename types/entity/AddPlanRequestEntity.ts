export type PlanType = 'PERSONAL' | 'GROUP';

export type PrivacyLevel = 'PERSONAL_PUBLIC' | 'PERSONAL_PRIVATE' | 'GROUP_PUBLIC' | 'GROUP_PRIVATE';

export type RecurrenceFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type DayOfWeek = 'MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU';

export interface RecurrenceConfig {
  enabled: boolean;
  freq: RecurrenceFreq;
  interval: number;
  byDays: DayOfWeek[];
  count?: number;
  exceptions?: string[]; // ISO 8601 날짜 문자열 배열
}

export interface AddPlanRequestEntity {
  type: PlanType;
  privacyLevel: PrivacyLevel;
  title: string;
  content: string;
  place: string;
  imageUrl?: string; // 대표사진 (첫 번째 사진)
  startTime: string; // ISO 8601 날짜 문자열
  endTime: string; // ISO 8601 날짜 문자열
  hasSavingsGoal: boolean;
  savingsAmount?: number | null;
  depositAccountNo?: string | null; // 입금계좌번호 (hasSavingsGoal이 true일 때)
  withdrawalAccountNo?: string | null; // 출금계좌번호 (hasSavingsGoal이 true일 때)
  participantIds?: string[] | null; // 참여자 ID 배열
  photos?: string[]; // 사진 URL 배열 (최대 5개)
  recurrence: RecurrenceConfig;
}
