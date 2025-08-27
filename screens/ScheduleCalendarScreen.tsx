import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Button,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MonthlyCalendar from "../components/MonthlyCalendar";
import TopTabs, { TopTabKey } from "../components/TopTabs";
import { useUser } from "../contexts/UserContext";
import { useMohaeyoung } from "../hooks/useMohaeyoungScreen";
import type { PlanEntity } from "../types";
import AccountDetailScreen from "./AccountDetailScreen";
import AccountScreen from "./AccountScreen";
import SavingScreen from "./SavingScreen";

const { height: screenHeight } = Dimensions.get("window");
const BOTTOM_SHEET_HEIGHT = screenHeight * 0.6; // 60% - 초기상태
const MIDDLE_SNAP_HEIGHT = screenHeight * 0.3; // 30% - 중간 snap
const FULL_SCREEN_HEIGHT = screenHeight * 0.95; // 95% - 전체화면
const DRAG_THRESHOLD = 50; // 드래그 임계값을 낮춰 더 민감하게
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
  const [activeTab, setActiveTab] = useState<TopTabKey>("일정");
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showAccountDetail, setShowAccountDetail] = useState(false);

  // 바텀시트 관련 상태
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [snapPosition, setSnapPosition] = useState<
    "bottom" | "middle" | "full"
  >("bottom");

  // 바텀시트 애니메이션
  const pan = useRef(new Animated.ValueXY()).current;
  const currentPosition = useRef(0);

  // 바텀시트 관련 refs
  const sheetRef = useRef<BottomSheetModal>(null);
  const footerHeightRef = useRef(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const insets = useSafeAreaInsets();

  // // snap points 계산
  // const snapPoints = useMemo(() => {
  //   const points = [
  //     `${(BOTTOM_SHEET_HEIGHT / screenHeight) * 100}%`,
  //     `${(MIDDLE_SNAP_HEIGHT / screenHeight) * 100}%`,
  //     `${(FULL_SCREEN_HEIGHT / screenHeight) * 100}%`,
  //   ];
  //   console.log("🔍 snapPoints 계산됨:", points);
  //   return points;
  // }, [screenHeight]); // screenHeight를 의존성에 추가

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
    return userPlans.filter((plan) => {
      const planKey = toKey(new Date(plan.startTime));
      return planKey === selectedKey;
    });
  }, [userPlans, selectedDate]);

  // 날짜 선택 시 바텀시트 열기
  const handleDateSelect = (date: Date) => {
    console.log("🔍 handleDateSelect 호출됨, 날짜:", date.toDateString());
    setSelectedDate(date);
    setSnapPosition("bottom");
    setIsExpanded(false);
    setIsBottomSheetVisible(true);
    console.log("🔍 setIsBottomSheetVisible(true) 호출됨");
    currentPosition.current = 0;
  };

  // 바텀시트 닫기
  const handleCloseBottomSheet = () => {
    console.log("🔍 handleCloseBottomSheet 호출됨");
    setIsBottomSheetVisible(false);
    setIsExpanded(false);
    setSnapPosition("bottom");
    pan.setValue({ x: 0, y: 0 });
    currentPosition.current = 0;
  };

  // 일정 삭제 핸들러
  const handleDeletePlan = (planId: string) => {
    // TODO: 일정 삭제 로직 구현
    console.log("Delete plan:", planId);
  };

  // 일정 완료 핸들러
  const handleCompletePlan = (planId: string) => {
    // TODO: 일정 완료 로직 구현
    console.log("Complete plan:", planId);
  };

  // 시간 포맷팅 함수
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

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
          return <AccountDetailScreen account={selectedAccount} />;
        }
        return (
          <View style={{ flex: 1, width: "100%", paddingTop: 8 }}>
            <AccountScreen onAccountPress={handleAccountPress} />
          </View>
        );
      case "일정":
        return (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
          >
            {/* 월간 달력 */}
            <MonthlyCalendar
              monthDate={monthDate}
              selectedDate={selectedDate}
              onChangeMonth={setMonthDate}
              onSelectDate={(d) => {
                console.log(
                  "🔍 MonthlyCalendar onSelectDate 호출됨, 날짜:",
                  d.toDateString()
                );
                presentModal();
                handleDateSelect(d);
              }}
              markedDates={marked}
            />

            {/* 선택된 날짜의 일정 목록 */}
            {
              /* {selectedDatePlans.length > */ false && (
                <View style={styles.plansContainer}>
                  <Text style={styles.plansTitle}>
                    {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                    일정
                  </Text>
                  {selectedDatePlans.map((plan, index) => (
                    <View key={plan.planId || index} style={styles.planItem}>
                      <View style={styles.planTimeContainer}>
                        <Text style={styles.planTime}>
                          {new Date(plan.startTime).toLocaleTimeString(
                            "ko-KR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
                        </Text>
                      </View>
                      <View style={styles.planContent}>
                        <Text style={styles.planTitle} numberOfLines={1}>
                          {plan.title}
                        </Text>
                        <Text style={styles.planDescription} numberOfLines={2}>
                          {plan.place || "장소 없음"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )
            }
          </ScrollView>
        );
      case "저축":
        return (
          <View style={{ flex: 1, width: "100%", paddingTop: 8 }}>
            <SavingScreen />
          </View>
        );
      default:
        return null;
    }
  };

  // 1. 바텀시트 ref를 BottomSheetModal 타입으로 생성합니다.
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // 2. snapPoints를 useMemo로 계산합니다. 이제 로그가 찍힐 겁니다.
  const snapPoints = useMemo(() => {
    console.log("✅ snapPoints가 계산되었습니다!");
    return ["50%", "90%"];
  }, []);

  // 3. 바텀시트를 여는 콜백 함수
  const presentModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  // 4. 바텀시트를 닫는 콜백 함수
  const dismissModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  useEffect(() => {}, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* TopTabs 추가 */}
        <TopTabs
          active={activeTab}
          onChange={handleTabChange}
          style={styles.tabsRow}
        />
      </View>

      {/* 탭에 따른 콘텐츠 렌더링 */}
      {renderContent()}

      {/* 새로운 바텀시트 */}

      {/* 조건문 없이 항상 렌더링하되, present()로 화면에 표시합니다. */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0} // 초기 snap 위치 (0번째 인덱스)
        snapPoints={snapPoints}
        // onDismiss={() => console.log("바텀시트 닫힘")}
      >
        <BottomSheetView style={styles.listContainer}>
          <Text style={styles.plansTitle}>
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
          </Text>
          {selectedDatePlans.length > 0 ? (
            selectedDatePlans.map((plan, index) => (
              <View key={plan.planId || index} style={styles.planItem}>
                {/* ... 일정 아이템 UI ... */}
                <Text>{plan.title}</Text>
              </View>
            ))
          ) : (
            <Text>선택된 날짜에 일정이 없습니다.</Text>
          )}
          <Button title="닫기" onPress={dismissModal} />
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
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

  // 일정 목록 스타일
  plansContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  planItem: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  planTimeContainer: {
    marginRight: 16,
    justifyContent: "center",
  },
  planTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  planContent: {
    flex: 1,
    justifyContent: "center",
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  // 바텀시트 스타일
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  // 일정 상세 정보 스타일
  eventsContainer: {
    paddingTop: 20,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  emptyEventsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEventsText: {
    fontSize: 16,
    color: "#666",
  },
});
