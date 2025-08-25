import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type AccountInfo = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance?: number;
};

// 샘플 계좌 데이터
const sampleAccounts: AccountInfo[] = [
  {
    id: '1',
    bankName: '신한은행',
    accountNumber: '110-123-456789',
    accountType: '입출금',
    balance: 1500000,
  },
  {
    id: '2',
    bankName: 'KB국민은행',
    accountNumber: '123-456-789012',
    accountType: '입출금',
    balance: 2500000,
  },
  {
    id: '3',
    bankName: '우리은행',
    accountNumber: '1002-123-456789',
    accountType: '입출금',
    balance: 800000,
  },
  {
    id: '4',
    bankName: '신한은행',
    accountNumber: '110-987-654321',
    accountType: '저축',
    balance: 5000000,
  },
  {
    id: '5',
    bankName: 'KB국민은행',
    accountNumber: '123-789-456123',
    accountType: '저축',
    balance: 3000000,
  },
];

export default function AccountSelectScreen() {
  const params = useLocalSearchParams();
  const accountType = (params.type as 'withdrawal' | 'deposit') || 'withdrawal';
  const router = useRouter();

  const handleAccountSelect = (account: AccountInfo) => {
    // TODO: 선택된 계좌 정보를 이전 화면으로 전달하는 로직 구현
    console.log('선택된 계좌:', account);
    router.back();
  };

  const renderAccountItem = ({ item }: { item: AccountInfo }) => (
    <TouchableOpacity
      style={styles.accountItem}
      onPress={() => handleAccountSelect(item)}
    >
      <View style={styles.accountInfo}>
        <View style={styles.bankInfo}>
          <Text style={styles.bankName}>{item.bankName}</Text>
          <Text style={styles.accountType}>{item.accountType}</Text>
        </View>
        <Text style={styles.accountNumber}>{item.accountNumber}</Text>
        {item.balance && (
          <Text style={styles.balance}>
            잔액: {item.balance.toLocaleString()}원
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {accountType === 'withdrawal' ? '출금계좌' : '입금계좌'} 선택
        </Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={sampleAccounts}
        renderItem={renderAccountItem}
        keyExtractor={(item) => item.id}
        style={styles.accountList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  accountList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  accountInfo: {
    flex: 1,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  accountType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  balance: {
    fontSize: 12,
    color: '#999',
  },
});
