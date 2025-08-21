// src/screens/MohaeyoungScreen.tsx
import PostBottomSheet from "@/components/post/PostBottomSheet";
import React from "react";
import { StyleSheet, View } from "react-native";
import FriendsList from "../components/FriendsList";
import WeekGrid from "../components/WeekGrid";
import { useBottomSheet } from "../hooks/useBottomSheet";
import { useMohaeyoung } from "../hooks/useMohaeyoungScreen";
import type { PlanEntity } from "../types";

export default function MohaeyoungScreen() {
    const { currentUser, friends, plans, loading, error, getCurrentWeekRange, refetch, onItemPress, setCurrentUserTo } = useMohaeyoung();
    const { 
        isVisible, 
        selectedPlan, 
        openBottomSheet, 
        closeBottomSheet 
    } = useBottomSheet();

    const { startDay, endDay } = getCurrentWeekRange();
    console.log('startDay:', startDay);
    console.log('endDay:', endDay);

    const handlePlanPress = (plan: PlanEntity) => {
        openBottomSheet(plan);
    };

    const handleWeekChange = (delta: -1 | 1) => {
        console.log("주 변경:", delta === 1 ? "다음 주" : "이전 주");
        // TODO: 주 변경 시 startDay, endDay 업데이트 로직 추가
    };

  return (
          <View style={styles.container}>
              <View>
                                      <FriendsList
                      friends={friends}
                      loading={loading}
                      errorText={error ? String(error) : null}
                      onRefresh={refetch}
                      onItemPress={onItemPress}
                      numColumns={4}
                      setCurrentUserTo={setCurrentUserTo}
                    />
              </View>
              {currentUser && (
                <View style={styles.weekGridContainer}>
                    <WeekGrid
                        plans={plans[currentUser.id] || []}
                        startDay={startDay}
                        endDay={endDay}
                        startHour={5}
                        endHour={21}
                        hourHeight={60}
                        visibleDays={5}
                        onChangeWeek={handleWeekChange}
                        onPressPlan={handlePlanPress}
                    />
                </View>
              )}
              
              {
                selectedPlan && (
                    <PostBottomSheet
                    plan={selectedPlan}
                    onClose={closeBottomSheet}/>
                )
              }
              
          </View>
      
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  weekGridContainer: {
    marginBottom: 60,
    flex: 1,
    padding: 16,
  },
});
