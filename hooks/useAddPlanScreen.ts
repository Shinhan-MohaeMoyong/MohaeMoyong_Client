import { useState } from 'react';
import type { RepeatConfig } from '../components/addPlan/RepeatOption';
import type { PhotoUploadEntity } from '../types/entity/PhotoUploadEntity';

export type AccountInfo = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance?: number;
};

export type AddPlanFormData = {
  // 기본 정보
  title: string;
  place: string;
  content: string;
  
  // 사진
  photo: PhotoUploadEntity | null;
  
  // 날짜/시간
  selectedDate: string;
  startTime: string;
  endTime: string;
  
  // 이벤트 타입
  eventType: 'group' | 'personal';
  
  // 공개/비공개
  isPublic: boolean;
  
  // 반복 설정
  repeatConfig: RepeatConfig;
  
  // 저축 옵션
  saveOption: boolean;
  withdrawalAccount: AccountInfo | null;
  depositAccount: AccountInfo | null;
  savingAmount: string;
};

export function useAddPlanScreen() {
  const [formData, setFormData] = useState<AddPlanFormData>({
    title: '',
    place: '',
    content: '',
    photo: null,
    selectedDate: new Date().getDate().toString(), // 오늘 날짜를 기본값으로
    startTime: '09:00',
    endTime: '10:00',
    eventType: 'personal',
    isPublic: true,
    repeatConfig: {
      enabled: false,
      freq: 'WEEKLY',
      interval: 1,
      byDays: [],
      until: null,
      count: null,
      exceptions: null
    },
    saveOption: false,
    withdrawalAccount: null,
    depositAccount: null,
    savingAmount: ''
  });

  const updateFormData = (updates: Partial<AddPlanFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleWithdrawalAccountSelect = (account: AccountInfo) => {
    updateFormData({ withdrawalAccount: account });
  };

  const handleDepositAccountSelect = (account: AccountInfo) => {
    updateFormData({ depositAccount: account });
  };

  const handleSavingAmountChange = (amount: string) => {
    // 숫자만 입력 가능하도록 필터링
    const numericAmount = amount.replace(/[^0-9]/g, '');
    updateFormData({ savingAmount: numericAmount });
  };

  const handlePhotoUpload = (photo: PhotoUploadEntity) => {
    updateFormData({ photo });
  };

  const handlePhotoRemove = () => {
    updateFormData({ photo: null });
  };

  const handleAddPlan = () => {
    console.log('=== 일정 추가 정보 ===');
    console.log('제목:', formData.title);
    console.log('장소:', formData.place);
    console.log('내용:', formData.content);
    console.log('사진:', formData.photo ? '업로드됨' : '없음');
    console.log('날짜:', formData.selectedDate);
    console.log('시작 시간:', formData.startTime);
    console.log('종료 시간:', formData.endTime);
    console.log('이벤트 타입:', formData.eventType === 'group' ? '단체 일정' : '개인 일정');
    console.log('공개 여부:', formData.isPublic ? '공개' : '비공개');
    console.log('저축 옵션:', formData.saveOption ? '활성화' : '비활성화');
    
    if (formData.saveOption) {
      console.log('=== 저축 정보 ===');
      console.log('출금계좌:', formData.withdrawalAccount);
      console.log('입금계좌:', formData.depositAccount);
      console.log('저축금액:', formData.savingAmount);
    }
    
    console.log('=== 반복 설정 ===');
    console.log('반복 활성화:', formData.repeatConfig.enabled);
    if (formData.repeatConfig.enabled) {
      console.log('반복 주기:', formData.repeatConfig.freq);
      console.log('반복 간격:', formData.repeatConfig.interval);
      console.log('반복 요일:', formData.repeatConfig.byDays);
      console.log('종료일:', formData.repeatConfig.until);
      console.log('반복 횟수:', formData.repeatConfig.count);
      console.log('예외일:', formData.repeatConfig.exceptions);
    }
    
    console.log('=== 전체 데이터 ===');
    console.log(JSON.stringify(formData, null, 2));
    
    // TODO: 실제 API 호출 로직 추가
    // 여기에 서버로 데이터를 전송하는 로직을 추가할 예정
  };

  return {
    formData,
    updateFormData,
    handleWithdrawalAccountSelect,
    handleDepositAccountSelect,
    handleSavingAmountChange,
    handlePhotoUpload,
    handlePhotoRemove,
    handleAddPlan
  };
}
