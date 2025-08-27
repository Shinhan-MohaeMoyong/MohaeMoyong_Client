import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AccountCard from '../components/AccountCard';
import TransactionItem from '../components/TransactionItem';
import { SERVER_URL } from '../constants/server';
import { getToken } from '../contexts/tokenManager';
import { AccountMapper } from '../mappers/AccountMapper';
import { AccountDetailDTO, TransactionDetailDTO } from '../types/dto/AccountDetailDTO';

interface Transaction {
  id: string;
  message: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: string;
}

interface Account {
  id: string;
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
}

interface AccountDetailProps {
  account: Account;
  achievementRate: number;
  transactions: Transaction[];
}

interface AccountDetailScreenProps {
  account: Account;
}

export default function AccountDetailScreen({ account }: AccountDetailScreenProps) {
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [achievementRate, setAchievementRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [accountDetail, setAccountDetail] = useState<AccountDetailDTO | null>(null);

  // API 응답을 내부 Transaction 타입으로 변환하는 함수
  const mapTransactionDTOToTransaction = (dto: TransactionDetailDTO, index: number): Transaction => {
    return {
      id: `${dto.transactionDate}_${dto.transactionTime}_${index}`,
      message: dto.transactionSummary,
      amount: dto.transactionBalance,
      type: dto.transactionType === '1' ? 'deposit' : 'withdrawal',
      date: formatTransactionDate(dto.transactionDate, dto.transactionTime),
    };
  };

  // 거래일자와 시간을 포맷팅하는 함수
  const formatTransactionDate = (date: string, time: string): string => {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    const hour = time.substring(0, 2);
    const minute = time.substring(2, 4);
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  };

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🏦 === 계좌 상세 정보 요청 ===');
      const accountNo = account.accountNumber;
      
      // 새로운 API 엔드포인트 호출
      const response = await fetch(`${SERVER_URL}/api/v1/account/${encodeURIComponent(accountNo)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`계좌 상세 정보 요청 실패: ${response.status} ${response.statusText}`);
      }

      const accountDetailResponse = await response.json();
      console.log('🏦 === 계좌 상세 정보 응답 ===');
      console.log(JSON.stringify(accountDetailResponse, null, 2));
      
      setAccountDetail(accountDetailResponse);
      
      // 거래내역을 내부 타입으로 변환
      const mappedTransactions = accountDetailResponse.list.map((transaction: TransactionDetailDTO, index: number) => 
        mapTransactionDTOToTransaction(transaction, index)
      );
      
      setTransactions(mappedTransactions);
      console.log('🏦 === 거래내역 변환 결과 ===');
      console.log(JSON.stringify(mappedTransactions, null, 2));
      
      // 달성률은 별도 API에서 가져오거나 계산
      // 현재는 임시로 0으로 설정
      setAchievementRate(0);
      
    } catch (e) {
      console.error('❌ 계좌 상세 정보 조회 실패:', e);
      
      let errorMessage = '계좌 상세 정보를 불러오지 못했습니다.';
      
      if (e instanceof Error) {
        if (e.message.includes('401')) {
          errorMessage = '인증이 필요합니다. 다시 로그인해 주세요.';
        } else if (e.message.includes('404')) {
          errorMessage = '계좌 정보를 찾을 수 없습니다.';
        } else if (e.message.includes('500')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 거래내역
  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type === filterType;
  });

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDetail();
    setRefreshing(false);
  };

  React.useEffect(() => {
    fetchDetail();
  }, []);

  // 필터 버튼 렌더링
  const renderFilterButton = (type: 'all' | 'deposit' | 'withdrawal', label: string) => {
    const isActive = filterType === type;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilterType(type)}
      >
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // 로딩 상태 표시
  if (loading && !accountDetail) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>계좌 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  // 에러 상태 표시
  if (error && !accountDetail) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDetail}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
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
        showsVerticalScrollIndicator={false}
      >
        {/* 계좌 정보 카드 */}
        <AccountCard
          account={AccountMapper.fromLegacyAccount(account)}
          onPress={() => {}}
        />

        {/* 달성률 */}
        <View style={styles.achievementContainer}>
          <Text style={styles.achievementTitle}>달성률</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${achievementRate}%` },
                ]}
              />
            </View>
            <Text style={styles.achievementRate}>{achievementRate}%</Text>
          </View>
        </View>

        {/* 내역 구분 필터 */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>내역 구분</Text>
          <View style={styles.filterButtons}>
            {renderFilterButton('all', '전체')}
            {renderFilterButton('deposit', '입금')}
            {renderFilterButton('withdrawal', '출금')}
          </View>
        </View>

        {/* 거래내역 목록 */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.transactionsTitle}>
            거래내역 ({filteredTransactions.length}건)
          </Text>
          
          {filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              message={transaction.message}
              amount={transaction.amount}
              type={transaction.type}
              date={transaction.date}
            />
          ))}
        </View>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  achievementContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 4,
  },
  achievementRate: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    minWidth: 40,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#A78BFA',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  transactionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
});
