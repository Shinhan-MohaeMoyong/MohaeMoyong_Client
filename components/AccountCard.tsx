import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AccountDTO } from '../types/dto/AccountDTO';

interface AccountCardProps {
  account: AccountDTO;
  onPress: () => void;
}

export default function AccountCard({
  account,
  onPress
}: AccountCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* 왼쪽: 은행 로고 */}
      <View style={styles.bankLogoContainer}>
        <View style={styles.bankLogo}>
          <Text style={styles.bankLogoText}>{account.bankName.charAt(0)}</Text>
        </View>
        <Text style={styles.bankName}>{account.bankName}</Text>
      </View>
      
      {/* 오른쪽: 계좌 정보 */}
      <View style={styles.accountInfo}>
        {/* 계좌번호 */}
        <Text style={styles.accountNumber}>
          {account.maskedAccountNumber}
        </Text>
        
        {/* 잔액 */}
        <Text style={styles.balance}>
          {account.balance}
        </Text>
        
        {/* 계좌 별칭 */}
        <Text style={styles.accountAlias}>
          {account.accountAlias}
        </Text>
        
        {/* 새 계좌 표시 */}
        {account.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
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
  newBadge: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
