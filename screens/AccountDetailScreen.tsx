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
import { AccountMapper } from '../mappers/AccountMapper';
import { fetchJson } from '../services/api';

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

  // 백엔드 응답 타입들
  interface AchievementDTO {
    achievementRate: number;
  }

  interface TransactionDTO {
    id: string;
    message: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    date: string;
  }

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const accountNo = account.accountNumber;
      const achievementPromise = fetchJson<AchievementDTO>(`/api/v1/account/achievement?accountNo=${encodeURIComponent(accountNo)}`);
      const transactionsPromise = fetchJson<TransactionDTO[]>(`/api/v1/account/transactions?accountNo=${encodeURIComponent(accountNo)}`);
      const [achievementRes, transactionsRes] = await Promise.all([achievementPromise, transactionsPromise]);

      setAchievementRate(achievementRes.achievementRate ?? 0);
      // 서버 스키마와 동일하다고 가정. 필요 시 매핑 조정
      setTransactions(transactionsRes);
    } catch (e) {
      setError('계좌 상세 정보를 불러오지 못했습니다.');
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
