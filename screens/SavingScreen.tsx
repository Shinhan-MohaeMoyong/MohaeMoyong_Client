import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import SavingInfo from '../components/SavingInfo';

interface WeeklySaving {
  week: number;
  amount: number;
}

interface SavingData {
  id: string;
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
  weeklySavings: WeeklySaving[];
  goalPeriod: string;
  achievementRate: number;
  monthlyComment: string;
  encouragementMessage: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function SavingScreen() {
  const [savingData, setSavingData] = useState<SavingData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 저축 정보를 가져오는 함수
  const fetchSavingData = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 엔드포인트로 변경
      const response = await fetch('YOUR_API_ENDPOINT/savings');
      
      if (!response.ok) {
        throw new Error('저축 정보를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setSavingData(data);
    } catch (error) {
      console.error('저축 정보 조회 오류:', error);
      // 임시 데이터로 대체 (개발용)
      setSavingData([
        {
          id: '1',
          accountNumber: '000-000-0000-000',
          balance: 189000,
          accountAlias: '학비 저축계좌',
          bankName: '신한 SOL Bank',
          weeklySavings: [
            { week: 1, amount: 48000 },
            { week: 2, amount: 52000 },
            { week: 3, amount: 45000 },
            { week: 4, amount: 38000 },
            { week: 5, amount: 42000 },
            { week: 6, amount: 48000 },
          ],
          goalPeriod: '24.08.11~25.08.11',
          achievementRate: 41,
          monthlyComment: '6월달에 48,000원이나 모았어요!',
          encouragementMessage: '학비 저축계좌 파이팅!',
        },
        {
          id: '2',
          accountNumber: '000-000-0000-001',
          balance: 100000,
          accountAlias: '맥북 저축계좌',
          bankName: '신한 SOL Bank',
          weeklySavings: [
            { week: 1, amount: 30000 },
            { week: 2, amount: 35000 },
            { week: 3, amount: 40000 },
            { week: 4, amount: 45000 },
            { week: 5, amount: 50000 },
            { week: 6, amount: 55000 },
          ],
          goalPeriod: '24.09.01~25.03.01',
          achievementRate: 65,
          monthlyComment: '맥북 구매까지 55,000원 모았어요!',
          encouragementMessage: '맥북 저축계좌 화이팅!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavingData();
    setRefreshing(false);
  };

  // 다음 계좌로 이동
  const goToNextAccount = () => {
    if (currentIndex < savingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 이전 계좌로 이동
  const goToPreviousAccount = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    fetchSavingData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>저축 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (savingData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>저축 정보가 없습니다.</Text>
      </View>
    );
  }

  const currentData = savingData[currentIndex];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        horizontal={false}
        showsVerticalScrollIndicator={false}
      >
        {/* 현재 계좌의 저축 정보 */}
        <SavingInfo
          accountNumber={currentData.accountNumber}
          balance={currentData.balance}
          accountAlias={currentData.accountAlias}
          bankName={currentData.bankName}
          weeklySavings={currentData.weeklySavings}
          goalPeriod={currentData.goalPeriod}
          achievementRate={currentData.achievementRate}
          monthlyComment={currentData.monthlyComment}
          encouragementMessage={currentData.encouragementMessage}
        />
      </ScrollView>

      {/* 계좌 전환 인디케이터 */}
      {savingData.length > 1 && (
        <View style={styles.navigationContainer}>
          <View style={styles.navigationDots}>
            {savingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.navigationDot,
                  index === currentIndex && styles.navigationDotActive,
                ]}
              />
            ))}
          </View>
          
          {/* 계좌 전환 버튼 */}
          <View style={styles.navigationButtons}>
            <Text
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={goToPreviousAccount}
            >
              이전
            </Text>
            <Text style={styles.currentAccountInfo}>
              {currentIndex + 1} / {savingData.length}
            </Text>
            <Text
              style={[
                styles.navButton,
                currentIndex === savingData.length - 1 && styles.navButtonDisabled,
              ]}
              onPress={goToNextAccount}
            >
              다음
            </Text>
          </View>
        </View>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  navigationContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  navigationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  navigationDotActive: {
    backgroundColor: '#A78BFA',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    fontSize: 16,
    color: '#A78BFA',
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonDisabled: {
    color: '#D1D5DB',
  },
  currentAccountInfo: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
