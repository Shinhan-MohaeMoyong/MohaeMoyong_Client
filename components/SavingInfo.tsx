import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AccountDTO } from '../types/dto/AccountDTO';
import { MonthlySavingDTO } from '../types/dto/SavingDTO';
import AccountCard from './AccountCard';

interface SavingInfoProps {
  accountNumber: string;
  balance: string; // 포맷된 잔액
  accountAlias: string;
  monthlySavings: MonthlySavingDTO[];
  achievementRate: number;
  encouragementMessage: string;
  onPress?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function SavingInfo({
  accountNumber,
  balance,
  accountAlias,
  monthlySavings,
  achievementRate,
  encouragementMessage,
  onPress
}: SavingInfoProps) {
  // 주차별 저축 금액의 최대값 계산
  const maxAmount = Math.max(...monthlySavings.map(s => s.amount));
  const maxYAxis = Math.ceil(maxAmount / 10000) * 10000;

  // Y축 눈금 값들 생성
  const yAxisValues = [];
  for (let i = 0; i <= 5; i++) {
    yAxisValues.push((maxYAxis / 5) * i);
  }

  // AccountCard용 DTO 생성
  const accountDTO: AccountDTO = {
    id: accountNumber,
    accountNumber: accountNumber,
    balance: balance,
    accountAlias: accountAlias,
    bankName: '신한은행', // 기본값
    bankLogo: '신한은행',
    maskedAccountNumber: accountNumber.replace(/(\d{3})-(\d{3})-(\d{6})/, '$1-***-$3'),
    isNew: false,
    createdAt: new Date(),
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      {/* 계좌 정보 카드 */}
      <AccountCard
        account={accountDTO}
        onPress={onPress || (() => {})}
      />

      {/* 월별 저축 현황 그래프 */}
      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>주차별 저축 현황</Text>
        
        {/* Y축 눈금과 막대 그래프 */}
        <View style={styles.graphContent}>
          {/* Y축 눈금 */}
          <View style={styles.yAxis}>
            {yAxisValues.reverse().map((value, index) => (
              <Text key={index} style={styles.yAxisLabel}>
                {value.toLocaleString()}
              </Text>
            ))}
          </View>
          
          {/* 막대 그래프 */}
          <View style={styles.barsContainer}>
            {monthlySavings.map((saving, index) => (
              <View key={index} style={styles.barItem}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (saving.amount / maxYAxis) * 200,
                        backgroundColor: '#A78BFA',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.weekLabel}>{saving.week}주차</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 저축 목표 및 달성률 */}
      <View style={styles.goalContainer}>
        <View style={styles.achievementContainer}>
          <Text style={styles.achievementText}>* 달성률: </Text>
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
      </View>

      {/* 격려 메시지 */}
      <View style={styles.messageContainer}>
        <Text style={styles.encouragementMessage}>{encouragementMessage}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  graphContainer: {
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
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  graphContent: {
    flexDirection: 'row',
    height: 220,
  },
  yAxis: {
    justifyContent: 'space-between',
    marginRight: 16,
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 30,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    justifyContent: 'flex-end',
    height: 200,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  weekLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
  goalContainer: {
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
  goalText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementText: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
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
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    minWidth: 35,
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  monthlyComment: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  encouragementMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
});
