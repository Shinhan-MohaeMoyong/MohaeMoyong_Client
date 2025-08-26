import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AccountCard from '../components/AccountCard';
import { AccountMapper } from '../mappers/AccountMapper';
import { fetchJson } from '../services/api';
import AddAccountScreen from './AddAccountScreen';

interface Account {
  id: string;
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
}

interface AccountScreenProps {
  onAccountPress: (account: Account) => void;
}

export default function AccountScreen({ onAccountPress }: AccountScreenProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  // 백엔드 응답 DTO
  interface SimpleAccountDTO {
    accountNo: string;
    accountBalance: number;
    accountName: string;
  }

  // 계좌 목록 가져오기
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const endpoint = '/api/v1/account/simpleList';
      const data = await fetchJson<SimpleAccountDTO[]>(endpoint);

      // DTO → 화면에서 쓰는 Legacy Account로 매핑 (기존 뷰 로직 유지)
      const mapped: Account[] = data.map((item) => ({
        id: item.accountNo,
        accountNumber: item.accountNo,
        balance: item.accountBalance,
        accountAlias: item.accountName,
        bankName: '신한은행', // 응답에 없으므로 기본값
      }));

      setAccounts(mapped);
    } catch (error) {
      Alert.alert('오류', '계좌 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  // 새로운 계좌 추가하기
  const handleAddAccount = () => {
    setShowAddAccount(true);
  };

  // 상품 선택 처리
  const handleProductSelect = (product: any) => {
    // 상품 선택 완료 후 AddAccountScreen 닫기
    setShowAddAccount(false);
    
    // 계좌 목록 새로고침 (새로 생성된 계좌 반영)
    fetchAccounts();
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 새로운 계좌 추가 화면이 표시되는 경우
  if (showAddAccount) {
    return (
      <AddAccountScreen
        onProductSelect={handleProductSelect}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>계좌 목록을 불러오는 중...</Text>
          </View>
        ) : accounts.length > 0 ? (
          accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={AccountMapper.fromLegacyAccount(account)}
              onPress={() => onAccountPress(account)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 계좌가 없습니다.</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addAccountButton}
          onPress={handleAddAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>새로운 계좌 추가하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  addAccountButton: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
