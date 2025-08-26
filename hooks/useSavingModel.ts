import { useCallback, useState } from 'react';
import { SERVER_URL } from '../constants/server';
import { getToken } from '../contexts/tokenManager';
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
    setLoading(true);
    setError(null);

    try {
      const endpoint = `${SERVER_URL}/api/v1/account/savingState`;
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${await getToken()}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}, message: ${res.statusText}`);
      }

      const data = await res.json();

      const savingStateEntities: SavingStateEntity[] = data.map((item: any) => ({
        accountNumber: item.accountNumber,
        balance: item.balance,
        accountAlias: item.accountAlias,
        monthlySavings: item.monthlySavings || [],
        achievementRate: item.achievementRate,
      }));

      setSavingStates(savingStateEntities);
    } catch (err) {
      // 네트워크 실패 또는 서버 5xx → Mock 폴백
      if (
        (err instanceof Error && err.message.includes('Failed to fetch')) ||
        (err instanceof Error && err.message.includes('HTTP error! status: 5'))
      ) {
        setSavingStates(mockSavingStates);
      } else {
        let errorMessage = err instanceof Error ? err.message : '저축 정보를 불러오는데 실패했습니다.';
        if (err instanceof Error && err.message.includes('HTTP error! status: 401')) {
          errorMessage = '인증이 필요합니다. 다시 로그인해 주세요.';
        }
        setError(errorMessage);
      }
    } finally {
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
