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

interface Account {
  id: string;
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
}

export default function AccountScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 계좌 정보를 가져오는 함수
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 엔드포인트로 변경
      const response = await fetch('YOUR_API_ENDPOINT/accounts');
      
      if (!response.ok) {
        throw new Error('계좌 정보를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('계좌 정보 조회 오류:', error);
      // 임시 데이터로 대체 (개발용)
      setAccounts([
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
          balance: 100000,
          accountAlias: '맥북 저축계좌',
          bankName: '신한 SOL Bank',
        },
        {
          id: '3',
          accountNumber: '000-000-0000-002',
          balance: 30000,
          accountAlias: '비상금 저축계좌',
          bankName: '신한 SOL Bank',
        },
      ]);
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
    Alert.alert(
      '새로운 계좌 추가',
      '새로운 계좌를 추가하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '추가',
          onPress: () => {
            // TODO: 새로운 계좌 추가 로직 구현
            console.log('새로운 계좌 추가');
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>계좌 정보를 불러오는 중...</Text>
      </View>
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
      >
        {/* 계좌 목록 */}
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            accountNumber={account.accountNumber}
            balance={account.balance}
            accountAlias={account.accountAlias}
            bankName={account.bankName}
          />
        ))}
        
        {/* 새로운 계좌 추가하기 버튼 */}
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
});
