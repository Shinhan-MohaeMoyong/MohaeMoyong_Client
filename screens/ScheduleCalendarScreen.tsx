import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MonthlyCalendar from "../components/MonthlyCalendar";
import TopTabs, { TopTabKey } from "../components/TopTabs";
import { useUser } from "../contexts/UserContext";
import { useMohaeyoung } from "../hooks/useMohaeyoungScreen";
import type { PlanEntity } from "../types";

const { height: screenHeight } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = screenHeight * 0.6;
const DRAG_THRESHOLD = 100;

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
  const [activeTab, setActiveTab] = useState<TopTabKey>("일정");
  
  // 바텀시트 관련 상태
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  
  // 바텀시트 애니메이션
  const pan = useRef(new Animated.ValueXY()).current;

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
    setMonthDate(date);
    
    // 바텀시트 열기 전에 초기 위치 설정
    pan.setValue({ x: 0, y: BOTTOM_SHEET_HEIGHT });
    
    // 선택된 날짜에 관계없이 바텀시트 열기
    setIsBottomSheetVisible(true);
    
    // 약간의 지연 후 애니메이션 시작
    setTimeout(() => {
      Animated.spring(pan.y, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start((result) => {
        // 애니메이션이 성공적으로 완료된 경우에만 상태 유지
        if (result.finished) {
          // 애니메이션 완료 후 추가 작업이 필요한 경우 여기에 작성
        }
      });
    }, 100);
  };

  // 바텀시트 닫기
  const handleCloseBottomSheet = () => {
    // 바텀시트가 이미 닫혀있는 경우 중복 실행 방지
    if (!isBottomSheetVisible) return;
    
    Animated.timing(pan.y, {
      toValue: BOTTOM_SHEET_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start((result) => {
      if (result.finished) {
        setIsBottomSheetVisible(false);
        pan.setValue({ x: 0, y: BOTTOM_SHEET_HEIGHT });
      }
    });
  };

  // 바텀시트 팬 제스처 핸들러
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: 0,
          y: 0,
        });
      },
      onPanResponderMove: (_, gestureState) => {
        // 위로 드래그는 제한
        if (gestureState.dy < 0) {
          pan.y.setValue(0);
        } else {
          pan.y.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        
        // 드래그 거리가 임계값을 넘으면 닫기
        if (gestureState.dy > DRAG_THRESHOLD) {
          handleCloseBottomSheet();
        } else {
          // 원래 위치로 돌아가기
          Animated.spring(pan.y, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // 바텀시트가 열릴 때 초기 위치 설정 - 제거
  // React.useEffect(() => {
  //   if (isBottomSheetVisible) {
  //     pan.setValue({ x: 0, y: BOTTOM_SHEET_HEIGHT });
  //   }
  // }, [isBottomSheetVisible]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.sideBox}>
          <Pressable onPress={() => { /* 뒤로가기 연결 예정 */ }} hitSlop={8}>
            <Text style={styles.backIcon}>{"<"}</Text>
          </Pressable>
        </View>
        <TopTabs active={activeTab} onChange={setActiveTab} style={styles.tabsRow} />
        <View style={styles.sideBox} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {activeTab === "일정" ? (
          <>
            <MonthlyCalendar
              monthDate={monthDate}
              selectedDate={selectedDate}
              onChangeMonth={setMonthDate}
              onSelectDate={(d) => {
                handleDateSelect(d);
              }}
              markedDates={marked}
            />
            
            {/* 선택된 날짜의 일정 목록 */}
            {selectedDatePlans.length > 0 && (
              <View style={styles.plansContainer}>
                <Text style={styles.plansTitle}>
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
                </Text>
                {selectedDatePlans.map((plan, index) => (
                  <View
                    key={plan.planId || index}
                    style={styles.planItem}
                  >
                    <View style={styles.planTimeContainer}>
                      <Text style={styles.planTime}>
                        {new Date(plan.startTime).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </Text>
                    </View>
                    <View style={styles.planContent}>
                      <Text style={styles.planTitle} numberOfLines={1}>
                        {plan.title}
                      </Text>
                      <Text style={styles.planDescription} numberOfLines={2}>
                        {plan.place || '장소 없음'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <View />
        )}
      </ScrollView>

      {/* 새로운 바텀시트 */}
      {isBottomSheetVisible && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} onPress={handleCloseBottomSheet} />
          <Animated.View 
            style={[
              styles.bottomSheet,
              {
                transform: [
                  { translateY: pan.y },
                ],
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
            
            {/* 닫기 버튼 */}
            <View style={styles.closeButtonContainer}>
              <TouchableOpacity onPress={handleCloseBottomSheet} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* 일정 상세 정보 */}
            <View style={styles.planDetailContainer}>
              <Text style={styles.planDetailTitle}>{selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정</Text>
              <Text style={styles.planDetailTime}>
                {selectedDate.toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </Text>
              
              {/* 일정 목록 */}
              {selectedDatePlans.length > 0 ? (
                <>
                  <View style={styles.bottomSheetPlansList}>
                    {selectedDatePlans.map((plan, index) => (
                      <View key={plan.planId || index} style={styles.bottomSheetPlanItem}>
                        <View style={styles.bottomSheetPlanTime}>
                          <Text style={styles.bottomSheetPlanTimeText}>
                            {new Date(plan.startTime).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            })}
                          </Text>
                        </View>
                        <View style={styles.bottomSheetPlanContent}>
                          <Text style={styles.bottomSheetPlanTitle} numberOfLines={1}>
                            {plan.title}
                          </Text>
                          <Text style={styles.bottomSheetPlanPlace} numberOfLines={1}>
                            📍 {plan.place || '장소 없음'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.planDetailMeta}>
                    <Text style={styles.planDetailMetaLabel}>총 일정:</Text>
                    <Text style={styles.planDetailMetaValue}>{selectedDatePlans.length}개</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.emptyPlansContainer}>
                    <Text style={styles.emptyPlansIcon}>📅</Text>
                    <Text style={styles.emptyPlansTitle}>일정이 없습니다</Text>
                    <Text style={styles.emptyPlansDescription}>
                      이 날에는 예정된 일정이 없습니다.{'\n'}
                      새로운 일정을 추가해보세요!
                    </Text>
                  </View>
                  
                  <View style={styles.planDetailMeta}>
                    <Text style={styles.planDetailMetaLabel}>총 일정:</Text>
                    <Text style={styles.planDetailMetaValue}>0개</Text>
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        </View>
      )}
    </View>
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
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
  backIcon: { fontSize: 20, color: "#222", fontWeight: "900" },
  sideBox: { width: 28, alignItems: "flex-start" },
  tabsRow: { marginLeft: 0, flex: 1 },
  
  // 일정 목록 스타일
  plansContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  planItem: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  planTimeContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  planTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  planContent: {
    flex: 1,
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

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
    maxHeight: BOTTOM_SHEET_HEIGHT,
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
  closeButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
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
});
