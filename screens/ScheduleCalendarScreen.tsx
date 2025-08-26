import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { AccountDetailView, MonthlyCalendar, TopTabKey, TopTabs } from "../components/moayong";
import { useUser } from "../contexts/UserContext";
import { useMohaeyoung } from "../hooks/useMohaeyoungScreen";
import type { PlanEntity } from "../types";
import AccountScreen from './AccountScreen';
import SavingScreen from './SavingScreen';

const { height: screenHeight } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = screenHeight * 0.6;        // 60% - 초기상태
const MIDDLE_SNAP_HEIGHT = screenHeight * 0.3;          // 30% - 중간 snap
const FULL_SCREEN_HEIGHT = screenHeight * 0.95;         // 95% - 전체화면
const DRAG_THRESHOLD = 50;  // 드래그 임계값을 낮춰 더 민감하게
const EXPAND_THRESHOLD = -80; // 확장 임계값도 낮춰 더 쉽게 확장되도록
const MIDDLE_THRESHOLD = -30; // 중간 snap 임계값

export default function ScheduleCalendarScreen() {
  const { loggedUser } = useUser();
  const { currentUser, plans, setCurrentUserTo } = useMohaeyoung({
    currentUser: loggedUser
      ? {
          id: loggedUser.userId,
          name: loggedUser.username,
          email: loggedUser.email,
          imageUrl: loggedUser.imageUrl,
          isNew: false,
        }
      : undefined,
  });

  const today = new Date();
  const [monthDate, setMonthDate] = useState<Date>(new Date(today));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(today));
  const [activeTab, setActiveTab] = useState<TopTabKey>("저축");
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showAccountDetail, setShowAccountDetail] = useState(false);
  
  // 바텀시트 관련 상태
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [snapPosition, setSnapPosition] = useState<'bottom' | 'middle' | 'full'>('bottom');
  
  // 바텀시트 애니메이션
  const pan = useRef(new Animated.ValueXY()).current;
  const currentPosition = useRef(0);

  React.useEffect(() => {
    if (loggedUser && setCurrentUserTo) {
      setCurrentUserTo({
        id: loggedUser.userId,
        name: loggedUser.username,
        email: loggedUser.email,
        imageUrl: loggedUser.imageUrl,
        isNew: false,
      });
    }
  }, [loggedUser, setCurrentUserTo]);

  // 바텀시트 초기화
  React.useEffect(() => {
    // 컴포넌트 마운트 시 초기 위치 설정
    pan.setValue({ x: 0, y: BOTTOM_SHEET_HEIGHT });
  }, []);

  const userPlans: PlanEntity[] = useMemo(() => {
    if (!currentUser) return [];
    return plans[currentUser.id] || [];
  }, [plans, currentUser]);

  const marked = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of userPlans) {
      const key = toKey(new Date(p.startTime));
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [userPlans]);

  // 선택된 날짜의 일정들
  const selectedDatePlans = useMemo(() => {
    const selectedKey = toKey(selectedDate);
    return userPlans.filter(plan => {
      const planKey = toKey(new Date(plan.startTime));
      return planKey === selectedKey;
    });
  }, [userPlans, selectedDate]);

  // 날짜 선택 시 바텀시트 열기
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSnapPosition('bottom');
    setIsExpanded(false);
    setIsBottomSheetVisible(true);
    currentPosition.current = 0;
  };

  // 바텀시트 닫기
  const handleCloseBottomSheet = () => {
    setIsBottomSheetVisible(false);
    setIsExpanded(false);
    setSnapPosition('bottom');
    pan.setValue({ x: 0, y: 0 });
    currentPosition.current = 0;
  };

  // snap 위치 계산 함수
  const getSnapPosition = (gestureState: any) => {
    const { dy } = gestureState;
    
    if (dy < EXPAND_THRESHOLD) {
      return 'full';      // 위로 충분히 드래그 → 전체화면
    } else if (dy < MIDDLE_THRESHOLD) {
      return 'middle';    // 위로 적당히 드래그 → 중간
    } else if (dy > DRAG_THRESHOLD) {
      return 'bottom';    // 아래로 충분히 드래그 → 닫기
    } else {
      return snapPosition; // 현재 위치 유지
    }
  };

  // snap 애니메이션 함수
  const snapToPosition = (position: 'bottom' | 'middle' | 'full') => {
    let targetY: number;
    
    switch (position) {
      case 'bottom':
        targetY = 0;
        setSnapPosition('bottom');
        setIsExpanded(false);
        break;
      case 'middle':
        targetY = -(MIDDLE_SNAP_HEIGHT - BOTTOM_SHEET_HEIGHT);
        setSnapPosition('middle');
        setIsExpanded(false);
        break;
      case 'full':
        targetY = -(FULL_SCREEN_HEIGHT - BOTTOM_SHEET_HEIGHT);
        setSnapPosition('full');
        setIsExpanded(true);
        break;
    }
    
    Animated.spring(pan.y, {
      toValue: targetY,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  // 바텀시트 팬 제스처 핸들러
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onPanResponderGrant: () => {
          pan.setOffset({ x: 0, y: 0 });
        },
        onPanResponderMove: (_, gestureState) => {
          // 현재 바텀시트의 위치를 기준으로 드래그 거리를 계산
          const newY = currentPosition.current + gestureState.dy;
          
          // 드래그 제한 설정
          const maxUpDrag = isExpanded ? 0 : -FULL_SCREEN_HEIGHT + BOTTOM_SHEET_HEIGHT;
          
          if (newY < maxUpDrag) {
            pan.y.setValue(maxUpDrag);
          } else if (newY > 0) {
            pan.y.setValue(0);
          } else {
            pan.y.setValue(newY);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy < -EXPAND_THRESHOLD && !isExpanded) {
            // 위로 드래그하여 확장
            setIsExpanded(true);
            setSnapPosition('full');
            const targetY = -FULL_SCREEN_HEIGHT + BOTTOM_SHEET_HEIGHT;
            pan.setValue({ x: 0, y: targetY });
            currentPosition.current = targetY;
          } else if (gestureState.dy > DRAG_THRESHOLD) {
            // 아래로 드래그하여 닫기
            handleCloseBottomSheet();
          } else if (isExpanded && gestureState.dy > MIDDLE_THRESHOLD) {
            // 확장된 상태에서 중간으로 축소
            setIsExpanded(false);
            setSnapPosition('middle');
            const targetY = -MIDDLE_SNAP_HEIGHT + BOTTOM_SHEET_HEIGHT;
            pan.setValue({ x: 0, y: targetY });
            currentPosition.current = targetY;
          } else {
            // 원래 위치로 복귀
            if (isExpanded) {
              const targetY = -FULL_SCREEN_HEIGHT + BOTTOM_SHEET_HEIGHT;
              pan.setValue({ x: 0, y: targetY });
              currentPosition.current = targetY;
            } else if (snapPosition === 'middle') {
              const targetY = -MIDDLE_SNAP_HEIGHT + BOTTOM_SHEET_HEIGHT;
              pan.setValue({ x: 0, y: targetY });
              currentPosition.current = targetY;
            } else {
              pan.setValue({ x: 0, y: 0 });
              currentPosition.current = 0;
            }
          }
        },
      }),
    [isExpanded, snapPosition]
  );

  // 바텀시트가 열릴 때 초기 위치 설정 - 제거
  // React.useEffect(() => {
  //   if (isBottomSheetVisible) {
  //     pan.setValue({ x: 0, y: BOTTOM_SHEET_HEIGHT });
  //   }
  // }, [isBottomSheetVisible]);

  const handleTabChange = (tab: TopTabKey) => {
    setActiveTab(tab);
    setShowAccountDetail(false);
    setSelectedAccount(null);
  };

  const handleAccountPress = (account: any) => {
    setSelectedAccount(account);
    setShowAccountDetail(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "계좌":
        if (showAccountDetail && selectedAccount) {
          return <AccountDetailView account={selectedAccount} />;
        }
                 return (
           <View style={{ flex: 1, width: '100%', paddingTop: 8 }}>
             <AccountScreen onAccountPress={handleAccountPress} />
           </View>
         );
                     case "일정":
        return (
          <View style={{ flex: 1, paddingTop: 4 }}>
           {/* 월간 달력 */}
           <MonthlyCalendar
             monthDate={monthDate}
             selectedDate={selectedDate}
             onChangeMonth={setMonthDate}
             onSelectDate={(d) => {
               handleDateSelect(d);
             }}
             markedDates={marked}
           />
         </View>
       );
             case "저축":
         return (
           <View style={{ flex: 1, width: '100%', paddingTop: 8 }}>
             <SavingScreen />
           </View>
         );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* TopTabs 추가 */}
        <TopTabs active={activeTab} onChange={handleTabChange} style={styles.tabsRow} />
      </View>

      {/* 탭에 따른 콘텐츠 렌더링 */}
      {renderContent()}

             {/* 새로운 바텀시트 */}
       {isBottomSheetVisible && (
         <View style={styles.overlay}>
           <TouchableOpacity style={styles.backdrop} onPress={handleCloseBottomSheet} />
           <SafeAreaView>
             <Animated.View 
               style={[
                 styles.bottomSheet,
                 {
                   transform: [
                     { translateY: pan.y },
                   ],
                   maxHeight: snapPosition === 'full' ? FULL_SCREEN_HEIGHT : 
                              snapPosition === 'middle' ? MIDDLE_SNAP_HEIGHT : 
                              BOTTOM_SHEET_HEIGHT,
                 },
               ]}
               >
            {/* 핸들 바 - 드래그 가능 */}
            <View 
              style={styles.handle}
              {...panResponder.panHandlers}
            >
              <View style={styles.handleBar} />
            </View>
            

            
            {/* 일정 상세 정보 컴포넌트 */}
            <View style={styles.eventDetail}>
              <Text style={styles.eventDetailText}>일정 상세 정보</Text>
              <Text style={styles.eventDetailText}>시작: 15:00</Text>
              <Text style={styles.eventDetailText}>종료: 19:00</Text>
              <Text style={styles.eventDetailText}>제목: 개인 공부</Text>
              <Text style={styles.eventDetailText}>장소: 집</Text>
                                      </View>
           </Animated.View>
             </SafeAreaView>
         </View>
       )}
     </SafeAreaView>
  );
}

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// 바텀시트 관련 유틸 제거

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff",
    width: '100%',
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    paddingHorizontal: 12, 
    paddingTop: 16, 
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  tabsRow: { flex: 1 },
  


  // 바텀시트 스타일
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    // maxHeight: BOTTOM_SHEET_HEIGHT, // This will be overridden by inline style
  },
  handle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  
  // 일정 상세 정보 스타일
  planDetailContainer: {
    paddingTop: 10,
  },
  planDetailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  planDetailTime: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 16,
  },
  planDetailDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  planDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  planDetailMetaLabel: {
    fontSize: 14,
    color: '#999',
    marginRight: 8,
  },
  planDetailMetaValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bottomSheetPlansList: {
    maxHeight: 200, // 스크롤 가능한 높이
    overflow: 'hidden',
  },
  bottomSheetPlanItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bottomSheetPlanTime: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetPlanTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  bottomSheetPlanContent: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 10,
  },
  bottomSheetPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  bottomSheetPlanPlace: {
    fontSize: 14,
    color: '#666',
  },
  emptyPlansContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyPlansIcon: {
    fontSize: 50,
    color: '#E0E0E0',
    marginBottom: 10,
  },
  emptyPlansTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyPlansDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  eventDetail: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  eventDetailText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
});
