import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TransactionItemProps {
  message: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  date: string;
}

export default function TransactionItem({
  message,
  amount,
  type,
  date
}: TransactionItemProps) {
  const isDeposit = type === 'deposit';
  const formattedAmount = amount.toLocaleString('ko-KR');
  const amountText = isDeposit ? `+ ${formattedAmount}원` : `- ${formattedAmount}원`;

  return (
    <View style={styles.container}>
      {/* 왼쪽: 거래내역 메시지 */}
      <View style={styles.messageContainer}>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      
      {/* 오른쪽: 거래 금액 */}
      <View style={styles.amountContainer}>
        <Text style={[
          styles.amount,
          isDeposit ? styles.depositAmount : styles.withdrawalAmount
        ]}>
          {amountText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageContainer: {
    flex: 1,
    marginRight: 16,
  },
  message: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 22,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  depositAmount: {
    color: '#10B981', // 초록색 (입금)
  },
  withdrawalAmount: {
    color: '#EF4444', // 빨간색 (출금)
  },
});
