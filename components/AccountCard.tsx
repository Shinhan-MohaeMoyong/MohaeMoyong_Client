import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AccountCardProps {
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
}

export default function AccountCard({
  accountNumber,
  balance,
  accountAlias,
  bankName
}: AccountCardProps) {
  // 잔액을 천 단위로 콤마 구분하여 포맷팅
  const formatBalance = (amount: number) => {
    return amount.toLocaleString('ko-KR');
  };

  // 계좌번호를 마스킹 처리 (뒤 4자리만 표시)
  const maskAccountNumber = (accountNum: string) => {
    if (accountNum.length <= 4) return accountNum;
    return '*'.repeat(accountNum.length - 4) + accountNum.slice(-4);
  };

  return (
    <View style={styles.container}>
      {/* 왼쪽: 은행 로고 */}
      <View style={styles.bankLogoContainer}>
        <View style={styles.bankLogo}>
          <Text style={styles.bankLogoText}>{bankName.charAt(0)}</Text>
        </View>
        <Text style={styles.bankName}>{bankName}</Text>
      </View>
      
      {/* 오른쪽: 계좌 정보 */}
      <View style={styles.accountInfo}>
        {/* 계좌번호 */}
        <Text style={styles.accountNumber}>
          {maskAccountNumber(accountNumber)}
        </Text>
        
        {/* 잔액 */}
        <Text style={styles.balance}>
          {formatBalance(balance)} 원
        </Text>
        
        {/* 계좌 별칭 */}
        <Text style={styles.accountAlias}>
          {accountAlias}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bankLogoContainer: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 80,
  },
  bankLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankLogoText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bankName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  accountInfo: {
    flex: 1,
  },
  accountNumber: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  balance: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  accountAlias: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
