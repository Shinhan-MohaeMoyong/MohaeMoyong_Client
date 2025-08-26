import React, { useEffect, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAccountModel } from '../hooks/useAccountModel';
import { AccountMapper } from '../mappers/AccountMapper';
import { AccountDTO } from '../types/dto/AccountDTO';
import AccountCard from './AccountCard';

// ViewModel 역할을 하는 Component
interface AccountListViewModelProps {
  onAccountPress: (account: AccountDTO) => void;
  onAddAccount: () => void;
}

export default function AccountListViewModel({ onAccountPress, onAddAccount }: AccountListViewModelProps) {
  // Model에서 Entity 데이터 가져오기
  const { accounts: accountEntities, loading, error, fetchAccounts } = useAccountModel();

  // Entity를 DTO로 변환 (매퍼 사용)
  const accountDTOs = useMemo(() => {
    return AccountMapper.toDTOList(accountEntities);
  }, [accountEntities]);

  // 초기 로딩
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // 새로고침 처리
  const handleRefresh = () => {
    fetchAccounts();
  };

  // 로딩 상태
  if (loading && accountDTOs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>계좌 목록을 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchAccounts}>
          다시 시도
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      {accountDTOs.map((accountDTO) => (
        <AccountCard
          key={accountDTO.id}
          account={accountDTO}
          onPress={() => onAccountPress(accountDTO)}
        />
      ))}
      
      {/* 새로운 계좌 추가 버튼 */}
      <View style={styles.addButtonContainer}>
        <Text style={styles.addButtonText} onPress={onAddAccount}>
          새로운 계좌 추가하기
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  addButtonContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
