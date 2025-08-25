import { useCallback, useState } from 'react';
import { SavingStateEntity } from '../types/entity/SavingEntity';

// Mock 데이터
const mockSavingStates: SavingStateEntity[] = [
  {
    accountNumber: "0014354908425733",
    balance: 189000,
    accountAlias: "학비 저축계좌",
    monthlySavings: [
      { week: 1, amount: 48000 },
      { week: 2, amount: 52000 },
      { week: 3, amount: 45000 },
      { week: 4, amount: 38000 },
      { week: 5, amount: 42000 },
      { week: 6, amount: 48000 },
    ],
    achievementRate: 41.0,
  },
  {
    accountNumber: "0017140134561303",
    balance: 100000,
    accountAlias: "맥북 저축계좌",
    monthlySavings: [
      { week: 1, amount: 30000 },
      { week: 2, amount: 35000 },
      { week: 3, amount: 40000 },
      { week: 4, amount: 45000 },
      { week: 5, amount: 50000 },
      { week: 6, amount: 55000 },
    ],
    achievementRate: 65.0,
  },
];

// Model Layer - API 요청 및 Entity 저장
export const useSavingModel = () => {
  const [savingStates, setSavingStates] = useState<SavingStateEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 요청 함수
  const fetchSavingStates = useCallback(async () => {
    console.log('🔄 [SavingModel] API 요청 시작');
    setLoading(true);
    setError(null);

    try {
      const apiUrl = 'http://localhost:8080/api/v1/account/savingState';
      console.log('📡 [SavingModel] API URL:', apiUrl);
      
      // 실제 API 호출 시도
      console.log('🌐 [SavingModel] fetch 요청 시작...');
      const response = await fetch(apiUrl);
      
      console.log('📊 [SavingModel] 응답 상태:', response.status);
      console.log('📋 [SavingModel] 응답 헤더:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [SavingModel] HTTP 에러:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      console.log('✅ [SavingModel] 응답 성공, JSON 파싱 시작...');
      const data = await response.json();
      console.log('📦 [SavingModel] 파싱된 데이터:', JSON.stringify(data, null, 2));
      
      // API 응답을 Entity로 변환
      console.log('🔄 [SavingModel] Entity 변환 시작...');
      const savingStateEntities: SavingStateEntity[] = data.map((item: any, index: number) => {
        console.log(`📝 [SavingModel] 아이템 ${index + 1} 변환:`, item);
        return {
          accountNumber: item.accountNumber,
          balance: item.balance,
          accountAlias: item.accountAlias,
          monthlySavings: item.monthlySavings || [],
          achievementRate: item.achievementRate,
        };
      });

      console.log('✅ [SavingModel] Entity 변환 완료:', savingStateEntities);
      setSavingStates(savingStateEntities);
      console.log('💾 [SavingModel] 상태 업데이트 완료');
      
    } catch (err) {
      console.error('💥 [SavingModel] 에러 발생:', err);
      
      // 백엔드 서버가 없을 때 Mock 데이터 사용
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        console.log('🔄 [SavingModel] 백엔드 서버 연결 실패, Mock 데이터 사용');
        console.log('📦 [SavingModel] Mock 데이터:', mockSavingStates);
        setSavingStates(mockSavingStates);
        console.log('💾 [SavingModel] Mock 데이터로 상태 업데이트 완료');
      } else {
        const errorMessage = err instanceof Error ? err.message : '저축 정보를 불러오는데 실패했습니다.';
        console.error('💥 [SavingModel] 에러 메시지:', errorMessage);
        setError(errorMessage);
      }
    } finally {
      console.log('🏁 [SavingModel] API 요청 완료');
      setLoading(false);
    }
  }, []);

  return {
    // Entity 데이터
    savingStates,
    loading,
    error,
    
    // API 액션
    fetchSavingStates,
  };
};
