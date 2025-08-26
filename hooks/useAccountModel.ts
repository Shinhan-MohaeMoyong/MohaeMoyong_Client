import { useCallback, useState } from 'react';
import { SERVER_URL } from '../constants/server';
import { getToken } from '../contexts/tokenManager';
import { AccountMapper } from '../mappers/AccountMapper';
import { AccountEntity, CreateAccountRequestEntity, CreateAccountResponseEntity } from '../types/entity/AccountEntity';

// Model Layer - API 요청 및 Entity 저장
export const useAccountModel = () => {
  const [accounts, setAccounts] = useState<AccountEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API 요청 함수
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 실제 API 호출
      const endpoint = `${SERVER_URL}/api/accounts`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${await getToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 매퍼를 사용하여 API 응답을 Entity로 변환
      const accountEntities = AccountMapper.fromApiResponseList(data.accounts);

      setAccounts(accountEntities);
    } catch (err) {
      setError(err instanceof Error ? err.message : '계좌 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccount = useCallback(async (accountData: CreateAccountRequestEntity): Promise<CreateAccountResponseEntity> => {
    setError(null);

    try {
      const endpoint = `${SERVER_URL}/api/accounts`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`,
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 성공 시 계좌 목록 새로고침
      if (result.success) {
        await fetchAccounts();
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '계좌 생성에 실패했습니다.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchAccounts]);

  return {
    // Entity 데이터
    accounts,
    loading,
    error,
    
    // API 액션
    fetchAccounts,
    createAccount,
  };
};
