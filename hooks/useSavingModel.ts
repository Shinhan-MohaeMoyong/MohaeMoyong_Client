import { useCallback, useState } from 'react';
import { SERVER_URL } from '../constants/server';
import { getToken } from '../contexts/tokenManager';
import { SavingStateEntity } from '../types/entity/SavingEntity';

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
      console.log('💰 === 저축 정보 요청 ===');
      const endpoint = '/api/v1/account/savingState';
      
      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`저축 정보 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('💰 === 저축 정보 응답 ===');
      console.log(JSON.stringify(data, null, 2));

      const savingStateEntities: SavingStateEntity[] = data.map((item: any) => ({
        accountNumber: item.accountNumber,
        balance: item.balance,
        accountAlias: item.accountAlias,
        monthlySavings: item.monthlySavings || [],
        achievementRate: item.achievementRate,
      }));

      setSavingStates(savingStateEntities);
      console.log('💰 === 저축 정보 변환 결과 ===');
      console.log(JSON.stringify(savingStateEntities, null, 2));

    } catch (err) {
      console.error('❌ 저축 정보 가져오기 실패:', err);
      
      let errorMessage = err instanceof Error ? err.message : '저축 정보를 불러오는데 실패했습니다.';
      
      if (err instanceof Error && err.message.includes('401')) {
        errorMessage = '인증이 필요합니다. 다시 로그인해 주세요.';
      }
      
      setError(errorMessage);
      setSavingStates([]); // 에러 시 빈 배열로 설정
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