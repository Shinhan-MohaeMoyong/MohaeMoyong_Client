// src/screens/MohaeyoungScreen.tsx
import MohaeyoungHeader from "@/components/MohaeyoungHeader";
import PostBottomSheet from "@/components/post/PostBottomSheet";
import { useRouter } from "expo-router";
import { useEffect } from "react";
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
    const { 
        currentUser, 
        friends, 
        plans, 
        loading, 
        error, 
        getCurrentWeekInfo, 
        changeWeek,
        refetch, 
        onItemPress, 
        setCurrentUserTo 
    } = useMohaeyoung({
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
        postBottomSheetData,
        openBottomSheet, 
        closeBottomSheet 
    } = usePostBottomSheet();

    const weekInfo = getCurrentWeekInfo();
    console.log('weekInfo:', weekInfo);

    const handlePlanPress = async (plan: PlanEntity) => {
        // usePostBottomSheet 훅에서 모든 로직을 처리하므로 plan만 전달
        openBottomSheet(plan);
    };

    const handleWeekChange = (delta: -1 | 1) => {
        console.log("주 변경:", delta === 1 ? "다음 주" : "이전 주");
        changeWeek(delta === 1 ? 'next' : 'prev');
    };

    const handleAddPlan = () => {
        router.push('/add-plan');
    };

    const handleEditPlan = (planId: number) => {
        // 수정 화면으로 이동 (임시로 add-plan으로 이동)
        router.push('/add-plan');
    };

    const handleDeletePlan = (planId: number) => {
        // 삭제 로직 구현
        console.log('삭제할 planId:', planId);
        // TODO: 실제 삭제 API 호출
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
            <MohaeyoungHeader 
                onPressAdd={handleAddPlan}
                name={currentUser?.name}
                weekLabel={`${weekInfo.weekLabel} (${weekInfo.dateRange})`}
            />
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
                        startDay={weekInfo.startDay}
                        endDay={weekInfo.endDay}
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
                 (postBottomSheetData) && (
                     <PostBottomSheet
                         plan={selectedPlan || undefined}
                         postData={postBottomSheetData || undefined}
                         friends={friends}
                         onClose={closeBottomSheet}
                         onEdit={handleEditPlan}
                         onDelete={handleDeletePlan}
                     />
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
    marginBottom: 10,
    flex: 1,
    padding: 16,
  },
});