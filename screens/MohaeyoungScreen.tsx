// src/screens/MohaeyoungScreen.tsx
import MohaeyoungHeader from "@/components/MohaeyoungHeader";
import PostBottomSheet from "@/components/post/PostBottomSheet";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import FriendsList from "../components/FriendsList";
import WeekGrid from "../components/WeekGrid";
import { useUser } from "../contexts/UserContext";
import { useMohaeyoung } from "../hooks/useMohaeyoungScreen";
import { usePostBottomSheet } from "../hooks/usePostBottomSheet";
import type { PlanEntity } from "../types";

export default function MohaeyoungScreen() {
    const router = useRouter();
    const { loggedUser } = useUser();
    const { currentUser, friends, plans, loading, error, getCurrentWeekRange, refetch, onItemPress, setCurrentUserTo } = useMohaeyoung({
        currentUser: loggedUser ? {
            id: loggedUser.userId,
            name: loggedUser.username,
            email: loggedUser.email,
            imageUrl: loggedUser.imageUrl,
            isNew: false,
        } : undefined
    });
    const { 
        isVisible, 
        selectedPlan, 
        openBottomSheet, 
        closeBottomSheet 
    } = usePostBottomSheet();

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

    const handleAddPlan = () => {
        router.push('/add-plan');
    };

    // loggedUser가 변경될 때마다 currentUser 업데이트
    useEffect(() => {
        if (loggedUser && setCurrentUserTo) {
            const userDTO = {
                id: loggedUser.userId,
                name: loggedUser.username,
                email: loggedUser.email,
                imageUrl: loggedUser.imageUrl,
                isNew: false
            };
            setCurrentUserTo(userDTO);
        }
    }, [loggedUser]);

    return (
        <View style={styles.container}>
            <MohaeyoungHeader onPressAdd={handleAddPlan}/>
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
    padding: 16,
  },
  weekGridContainer: {
    marginBottom: 60,
    flex: 1,
    padding: 16,
  },
});
