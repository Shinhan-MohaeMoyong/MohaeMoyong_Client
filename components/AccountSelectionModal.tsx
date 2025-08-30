// components/account/AccountSelectionModal.tsx
import AccountCard from '@/components/AccountCard';
import { SERVER_URL } from '@/constants/server';
import { getToken } from '@/contexts/tokenManager';
import { AccountMapper } from '@/mappers/AccountMapper';
import AddAccountScreen from '@/screens/AddAccountScreen';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type Account = {
  id: string;
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onAccountSelect: (account: Account) => void;
  type: 'deposit' | 'withdrawal';
};

const maskTail = (n: string, visible: number = 4) => {
  const parts = n.split('-');
  return parts
    .map((p, i) => {
      if (i === parts.length - 1) {
        if (p.length <= visible) return p;
        return p.slice(0, p.length - visible).replace(/[0-9]/g, '*') + p.slice(-visible);
      }
      return p.replace(/[0-9]/g, '*');
    })
    .join('-');
};

export default function AccountSelectionModal({
  visible,
  onClose,
  onAccountSelect,
  type,
}: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  interface SimpleAccountDTO {
    accountNo: string;
    accountBalance: number;
    accountName: string;
  }

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const endpoint = '/api/v1/account/simpleList';
      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`계좌 목록 요청 실패: ${response.status} ${response.statusText}`);
      const data: SimpleAccountDTO[] = await response.json();
      const mapped: Account[] = data.map((item) => ({
        id: item.accountNo,
        accountNumber: item.accountNo,
        balance: item.accountBalance,
        accountAlias: item.accountName,
        bankName: '신한은행',
      }));
      setAccounts(mapped);
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '계좌 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  const handleProductSelect = () => {
    setShowAddAccount(false);
    fetchAccounts();
  };

  const handleSelect = (acc: Account) => {
    onAccountSelect(acc);
    onClose();
  };

  useEffect(() => {
    if (visible) fetchAccounts();
  }, [visible]);

  const headerTitle = type === 'deposit' ? '입금계좌 선택' : '출금계좌 선택';

  return (
    <Modal
      visible={visible || showAddAccount} // ← 추가 화면으로 가도 Modal은 유지
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      transparent={Platform.OS === 'android'}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {showAddAccount ? (
        // 🔹 내부 콘텐츠만 교체 (Modal은 그대로)
        <AddAccountScreen onProductSelect={handleProductSelect} />
      ) : (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>계좌 목록을 불러오는 중...</Text>
              </View>
            ) : accounts.length ? (
              accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={AccountMapper.fromLegacyAccount({
                    ...account,
                    accountNumber:
                      type === 'deposit' ? maskTail(account.accountNumber, 4) : account.accountNumber,
                  })}
                  onPress={() => handleSelect(account)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>등록된 계좌가 없습니다.</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.addAccountButton}
              onPress={() => setShowAddAccount(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={styles.addButtonText}>새로운 계좌 추가하기</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  closeButton: { paddingVertical: 8, paddingHorizontal: 12 },
  closeButtonText: { fontSize: 16, color: '#6b7280' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  placeholder: { width: 60 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { fontSize: 16, color: '#6B7280' },
  addAccountButton: {
    backgroundColor: '#8C93FF', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    marginTop: 8,
  },
  addButtonIcon: { fontSize: 20, color: '#FFFFFF', fontWeight: 'bold', marginRight: 8 },
  addButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, color: '#6B7280' },
});
