import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import EventItem from "../components/EventItem";
import MonthlyCalendar from "../components/MonthlyCalendar";
import TopTabs, { TopTabKey } from "../components/TopTabs";
import { useUser } from "../contexts/UserContext";
import { useMohaeyoung } from "../hooks/useMohaeyoungScreen";
import type { PlanEntity } from "../types";
import AccountDetailScreen from "./AccountDetailScreen";
import AccountScreen from "./AccountScreen";
import SavingScreen from "./SavingScreen";

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

  const handleBack = () => {
    setShowAccountDetail(false);
    setSelectedAccount(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "계좌":
        if (showAccountDetail && selectedAccount) {
          return <AccountDetailScreen account={selectedAccount} onBack={handleBack} />;
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

  // 바텀시트 ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // snapPoints 계산
  const snapPoints = useMemo(() => {
    console.log("✅ snapPoints가 계산되었습니다!");
    return ["50%", "90%"];
  }, []);

  // 바텀시트를 여는 콜백 함수
  const presentModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  // 바텀시트를 닫는 콜백 함수
  const dismissModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

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

      {/* 바텀시트 */}
      {activeTab === "일정" && (
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          handleIndicatorStyle={{
            backgroundColor: "#000000FF",
            width: 60,
            height: 6,
          }}
          backgroundStyle={styles.bottomSheetBackground}
        >
          <ScrollView>
            <BottomSheetView style={styles.listContainer}>
              {/* 선택된 날짜의 일정들 */}
              <View style={styles.eventsContainer}>
                <Text style={styles.eventsTitle}>
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                  일정
                </Text>

                {selectedDatePlans.length > 0 ? (
                  selectedDatePlans.map((plan, index) => (
                    <EventItem
                      key={plan.planId || index}
                      startTime={formatTime(new Date(plan.startTime))}
                      endTime={formatTime(new Date(plan.endTime))}
                      title={plan.title}
                      location={plan.place || "장소 없음"}
                      onDelete={() =>
                        handleDeletePlan(String(plan.planId || ""))
                      }
                      onComplete={() =>
                        handleCompletePlan(String(plan.planId || ""))
                      }
                      withdrawalAccount="신한은행 123-456"
                      depositAccount="카카오뱅크 789-012"
                    />
                  ))
                ) : (
                  <View style={styles.emptyEventsContainer}>
                    <Text style={styles.emptyEventsText}>
                      이 날의 일정이 없습니다.
                    </Text>
                    <Text style={styles.emptyEventsText}>
                      친구들과 함께 추억을 만들어보세요!
                    </Text>
                  </View>
                )}
              </View>
            </BottomSheetView>
          </ScrollView>
        </BottomSheetModal>
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

  // 바텀시트 스타일
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  bottomSheetBackground: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
  },
  topDivider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginBottom: 20,
  },
});
