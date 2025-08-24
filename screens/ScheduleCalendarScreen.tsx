import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MonthlyCalendar from "../components/MonthlyCalendar";
import TopTabs, { TopTabKey } from "../components/TopTabs";
import { useUser } from "../contexts/UserContext";
import { useMohaeyoung } from "../hooks/useMohaeyoungScreen";
import type { PlanEntity } from "../types";

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

  // 바텀시트 관련 로직 완전 제거

  // 초기 마운트 후 onLayout에서 계산됨

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
                setSelectedDate(d);
                setMonthDate(d);
              }}
              markedDates={marked}
            />
            {/* 바텀시트 제거 */}
          </>
        ) : (
          <View />
        )
        }
      </ScrollView>
      {/* 바텀시트 제거 */}
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
  // 바텀시트 관련 스타일 제거
});
