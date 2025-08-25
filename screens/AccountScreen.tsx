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

  // 임시 데이터 (나중에 백엔드 API로 교체)
  const mockAccounts: Account[] = [
    {
      id: '1',
      accountNumber: '000-000-0000-000',
      balance: 189000,
      accountAlias: '학비 저축계좌',
      bankName: '신한 SOL Bank',
    },
    {
      id: '2',
      accountNumber: '000-000-0000-001',
      balance: 450000,
      accountAlias: '맥북 저축계좌',
      bankName: '신한은행',
    },
    {
      id: '3',
      accountNumber: '000-000-0000-002',
      balance: 120000,
      accountAlias: '비상금 저축계좌',
      bankName: '신한은행',
    },
  ];

  // 계좌 목록 가져오기
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출로 교체
      // const response = await fetch('/api/accounts');
      // const data = await response.json();
      // setAccounts(data);
      
      // 임시로 mock 데이터 사용
      setTimeout(() => {
        setAccounts(mockAccounts);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('계좌 목록을 가져오는데 실패했습니다:', error);
      Alert.alert('오류', '계좌 목록을 불러오는데 실패했습니다.');
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
            <TouchableOpacity
              key={account.id}
              onPress={() => onAccountPress(account)}
              activeOpacity={0.7}
            >
              <AccountCard
                accountNumber={account.accountNumber}
                balance={account.balance}
                accountAlias={account.accountAlias}
                bankName={account.bankName}
              />
            </TouchableOpacity>
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
