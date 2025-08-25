import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSavingModel } from '../hooks/useSavingModel';
import { SavingMapper } from '../mappers/SavingMapper';
import { SavingStateDTO } from '../types/dto/SavingDTO';
import SavingInfo from './SavingInfo';

const { width: screenWidth } = Dimensions.get('window');

// ViewModel 역할을 하는 Component
interface SavingViewModelProps {
  onAccountPress?: (account: SavingStateDTO) => void;
}

export default function SavingViewModel({ onAccountPress }: SavingViewModelProps) {
  console.log('🎯 [SavingViewModel] 컴포넌트 렌더링');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Model에서 Entity 데이터 가져오기
  const { savingStates: savingStateEntities, loading, error, fetchSavingStates } = useSavingModel();

  console.log('📊 [SavingViewModel] Entity 데이터:', {
    count: savingStateEntities.length,
    entities: savingStateEntities,
    loading,
    error
  });

  // Entity를 DTO로 변환 (매퍼 사용)
  const savingStateDTOs = useMemo(() => {
    console.log('🔄 [SavingViewModel] Entity → DTO 변환 시작');
    const dtos = SavingMapper.toDTOList(savingStateEntities);
    console.log('✅ [SavingViewModel] DTO 변환 완료:', dtos);
    return dtos;
  }, [savingStateEntities]);

  // 초기 로딩
  useEffect(() => {
    console.log('🚀 [SavingViewModel] 초기 로딩 시작');
    fetchSavingStates();
  }, [fetchSavingStates]);

  // 새로고침 처리
  const handleRefresh = () => {
    console.log('🔄 [SavingViewModel] 새로고침 시작');
    fetchSavingStates();
  };

  // 다음 계좌로 이동
  const goToNextAccount = () => {
    if (currentIndex < savingStateDTOs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // 이전 계좌로 이동
  const goToPreviousAccount = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // 로딩 상태
  if (loading && savingStateDTOs.length === 0) {
    console.log('⏳ [SavingViewModel] 로딩 상태 렌더링');
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>저축 정보를 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태
  if (error) {
    console.log('❌ [SavingViewModel] 에러 상태 렌더링:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchSavingStates}>
          다시 시도
        </Text>
      </View>
    );
  }

  // 데이터가 없는 경우
  if (savingStateDTOs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>저축 정보가 없습니다.</Text>
      </View>
    );
  }

  const currentAccount = savingStateDTOs[currentIndex];
  console.log('📱 [SavingViewModel] 메인 화면 렌더링, 현재 계좌:', currentAccount.accountAlias);

  return (
    <View style={styles.container}>
      {/* 현재 계좌의 저축 정보 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <SavingInfo
          key={currentAccount.accountNumber}
          accountNumber={currentAccount.accountNumber}
          balance={currentAccount.balance}
          accountAlias={currentAccount.accountAlias}
          monthlySavings={currentAccount.monthlySavings}
          achievementRate={currentAccount.achievementRate}
          encouragementMessage={currentAccount.encouragementMessage}
          onPress={() => {
            console.log('👆 [SavingViewModel] 계좌 클릭:', currentAccount.accountAlias);
            onAccountPress?.(currentAccount);
          }}
        />
      </ScrollView>

      {/* 계좌 전환 인디케이터 */}
      {savingStateDTOs.length > 1 && (
        <View style={styles.navigationContainer}>
          <View style={styles.navigationDots}>
            {savingStateDTOs.map((_, index) => (
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
            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={goToPreviousAccount}
              disabled={currentIndex === 0}
            >
              <Text style={[
                styles.navButtonText,
                currentIndex === 0 && styles.navButtonTextDisabled,
              ]}>
                이전
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.currentAccountInfo}>
              {currentIndex + 1} / {savingStateDTOs.length}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === savingStateDTOs.length - 1 && styles.navButtonDisabled,
              ]}
              onPress={goToNextAccount}
              disabled={currentIndex === savingStateDTOs.length - 1}
            >
              <Text style={[
                styles.navButtonText,
                currentIndex === savingStateDTOs.length - 1 && styles.navButtonTextDisabled,
              ]}>
                다음
              </Text>
            </TouchableOpacity>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  navButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  navButtonText: {
    fontSize: 16,
    color: '#A78BFA',
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#D1D5DB',
  },
  currentAccountInfo: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
