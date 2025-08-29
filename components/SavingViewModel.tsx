// import { useEffect, useMemo, useRef, useState } from 'react';
// import {
//   Dimensions,
//   FlatList,
//   NativeScrollEvent,
//   NativeSyntheticEvent,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
//   ViewToken,
// } from 'react-native';
// import { useSavingModel } from '../hooks/useSavingModel';
// import { SavingMapper } from '../mappers/SavingMapper';
// import { SavingStateDTO } from '../types/dto/SavingDTO';
// import SavingInfo from './SavingInfo';

// const { width: screenWidth } = Dimensions.get('window');
// const VIEWABILITY_CONFIG = { viewAreaCoveragePercentThreshold: 60 };

// interface SavingViewModelProps {
//   onAccountPress?: (account: SavingStateDTO) => void;
// }

// export default function SavingViewModel({ onAccountPress }: SavingViewModelProps) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const listRef = useRef<FlatList<SavingStateDTO>>(null);

//   // Model
//   const { savingStates: savingStateEntities, loading, error, fetchSavingStates } = useSavingModel();

//   // Entity -> DTO
//   const savingStateDTOs = useMemo(() => SavingMapper.toDTOList(savingStateEntities), [savingStateEntities]);

//   // 초기 로딩
//   useEffect(() => {
//     fetchSavingStates();
//   }, [fetchSavingStates]);

//   const handleRefresh = () => {
//     fetchSavingStates();
//   };

//   // 로딩 상태
//   if (loading && savingStateDTOs.length === 0) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>저축 정보를 불러오는 중...</Text>
//       </View>
//     );
//   }

//   // 에러 상태
//   if (error) {
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>{error}</Text>
//         <Text style={styles.retryText} onPress={fetchSavingStates}>다시 시도</Text>
//       </View>
//     );
//   }

//   // 데이터 없음
//   if (savingStateDTOs.length === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <Text style={styles.emptyText}>저축 정보가 없습니다.</Text>
//       </View>
//     );
//   }

//   // 페이지 변경 계산
//   const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//     const x = e.nativeEvent.contentOffset.x;
//     const index = Math.round(x / screenWidth);
//     if (index !== currentIndex) setCurrentIndex(index);
//   };

//   // 안드로이드에서 초기 index 보정
//   const onViewableItemsChanged = ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
//     if (viewableItems?.length > 0 && viewableItems[0].index != null) {
//       setCurrentIndex(viewableItems[0].index!);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* 가로 캐러셀 */}
//       <FlatList
//         ref={listRef}
//         data={savingStateDTOs}
//         keyExtractor={(item) => item.accountNumber}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         decelerationRate="fast"
//         snapToInterval={screenWidth}
//         snapToAlignment="start"
//         onMomentumScrollEnd={onMomentumEnd}
//         onViewableItemsChanged={onViewableItemsChanged}
//         viewabilityConfig={VIEWABILITY_CONFIG}
//         getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
//         renderItem={({ item }) => (
//           <View style={{ width: screenWidth }}>
//             {/* 각 페이지 내부는 세로 스크롤 + 당겨서 새로고침 */}
//             <ScrollView
//               style={styles.scrollView}
//               contentContainerStyle={styles.scrollContent}
//               refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
//               showsVerticalScrollIndicator={false}
//             >
//               <SavingInfo
//                 key={item.accountNumber}
//                 accountNumber={item.accountNumber}
//                 balance={item.balance}
//                 accountAlias={item.accountAlias}
//                 targetAmount={item.targetAmount}
//                 monthlySavings={item.monthlySavings}
//                 achievementRate={item.achievementRate}
//                 encouragementMessage={item.encouragementMessage}
//                 onPress={() => onAccountPress?.(item)}
//               />
//             </ScrollView>
//           </View>
//         )}
//       />

//       {/* 하단 페이지 인디케이터 */}
//       {savingStateDTOs.length > 1 && (
//         <View style={styles.navigationContainer}>
//           <View style={styles.navigationDots}>
//             {savingStateDTOs.map((_, index) => (
//               <View
//                 key={index}
//                 style={[
//                   styles.navigationDot,
//                   index === currentIndex && styles.navigationDotActive,
//                 ]}
//               />
//             ))}
//           </View>
//           <Text style={styles.currentAccountInfo}>
//             {currentIndex + 1} / {savingStateDTOs.length}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F9FAFB' },
//   scrollView: { flex: 1 },
//   scrollContent: { paddingTop: 8, paddingBottom: 40 },

//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   loadingText: { fontSize: 16, color: '#666' },

//   errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   errorText: { fontSize: 16, color: '#ff0000', textAlign: 'center', marginBottom: 10 },
//   retryText: { fontSize: 14, color: '#007AFF', textDecorationLine: 'underline' },

//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
//   emptyText: { fontSize: 16, color: '#666' },

//   navigationContainer: {
//     backgroundColor: '#FFFFFF',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//   },
//   navigationDots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 6, gap: 8 },
//   navigationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
//   navigationDotActive: { backgroundColor: '#A78BFA' },
//   currentAccountInfo: { textAlign: 'center', fontSize: 13, color: '#6B7280', fontWeight: '500' },
// });

// components/SavingViewModel.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useSavingModel } from '../hooks/useSavingModel';
import { SavingMapper } from '../mappers/SavingMapper';
import { SavingStateDTO } from '../types/dto/SavingDTO';
import SavingInfo from './SavingInfo';

const { width: screenWidth } = Dimensions.get('window');
const VIEWABILITY_CONFIG = { viewAreaCoveragePercentThreshold: 60 };

// 가운데 정렬용
const PAGE_HORIZONTAL_PADDING = 16;
const CONTENT_MAX_WIDTH = 600; // 필요시 480~640 내로 조정

interface SavingViewModelProps {
  onAccountPress?: (account: SavingStateDTO) => void;
}

export default function SavingViewModel({ onAccountPress }: SavingViewModelProps) {
  // 🔹 모든 훅은 최상단
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<SavingStateDTO>>(null);

  // Model
  const { savingStates: savingStateEntities, loading, error, fetchSavingStates } = useSavingModel();

  // DTO 변환
  const savingStateDTOs = useMemo(
    () => SavingMapper.toDTOList(savingStateEntities),
    [savingStateEntities]
  );

  // viewableItems 콜백 (레퍼런스 고정)
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems?.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index!);
      }
    }
  );

  // 초기 로딩 (deps 비움: 무한루프 방지)
  useEffect(() => {
    fetchSavingStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    fetchSavingStates();
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / screenWidth);
    if (index !== currentIndex) setCurrentIndex(index);
  };

  // 🔹 여기서부터 early return (훅 뒤에 배치!)
  if (loading && savingStateDTOs.length === 0) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.dimText}>저축 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchSavingStates}>
          다시 시도
        </Text>
      </View>
    );
  }

  if (savingStateDTOs.length === 0) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.dimText}>저축 정보가 없습니다.</Text>
      </View>
    );
  }

  return (
  <View style={styles.container}>
    {/* 상단 인디케이터 한 줄 */}
    {savingStateDTOs.length > 1 && (
      <View style={styles.indicatorRow}>
        <View style={styles.dots}>
          {savingStateDTOs.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, idx === currentIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    )}

    {/* 가로 캐러셀 */}
    <FlatList
      ref={listRef}
      data={savingStateDTOs}
      keyExtractor={(item) => item.accountNumber}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={screenWidth}
      snapToAlignment="start"
      onMomentumScrollEnd={onMomentumEnd}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={VIEWABILITY_CONFIG}
      getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
      renderItem={({ item }) => {
        const innerWidth = Math.min(
          screenWidth - PAGE_HORIZONTAL_PADDING * 2,
          CONTENT_MAX_WIDTH
        );
        return (
          <View style={{ width: screenWidth, flex: 1, backgroundColor: '#FFFFFF' }}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical={false}
              bounces={false}
            >
              <View style={[styles.contentCard, { width: innerWidth }]}>
                <SavingInfo
                  accountNumber={item.accountNumber}
                  balance={item.balance}
                  accountAlias={item.accountAlias}
                  targetAmount={item.targetAmount}
                  monthlySavings={item.monthlySavings}
                  achievementRate={item.achievementRate}
                  encouragementMessage={item.encouragementMessage}
                  onPress={() => onAccountPress?.(item)}
                />
              </View>
            </ScrollView>
          </View>
        );
      }}
    />
  </View>
);

}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  // 🔹 가운데 정렬 핵심
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 28,
    paddingHorizontal: PAGE_HORIZONTAL_PADDING,
    alignItems: 'center',
  },
  contentCard: {
    alignSelf: 'center',
    borderRadius: 16,
  },

  // 상태 공통
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  dimText: { fontSize: 16, color: '#6B7280' },
  errorText: { fontSize: 16, color: '#ff0000', textAlign: 'center', marginBottom: 10 },
  retryText: { fontSize: 14, color: '#007AFF', textDecorationLine: 'underline' },

  // 인디케이터 오버레이
  indicatorOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#A78BFA' },
  pageText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
});
