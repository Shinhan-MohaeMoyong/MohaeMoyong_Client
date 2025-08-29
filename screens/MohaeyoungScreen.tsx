// src/screens/MohaeyoungScreen.tsx
import MohaeyoungHeader from "@/components/MohaeyoungHeader";
import PostBottomSheet from "@/components/post/PostBottomSheet";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

    const headerWeekLabel = `${weekInfo.dateRange}`;

    return ( 
        <View style={styles.container}>
            <MohaeyoungHeader 
                onPressAdd={handleAddPlan}
                name={currentUser?.name} 
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

            {/* 가운데 주차 네비게이션 (‹ 주차 ›) */}
            <View style={styles.weekHeader}>
                <View style={styles.arrowWrapper}>
                    <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={() => handleWeekChange(-1)}
                    >
                    <Text style={styles.arrowText}>‹</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={styles.weekTitle}>{headerWeekLabel}</Text>
                </View>

                <View style={styles.arrowWrapper}>
                    <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={() => handleWeekChange(1)}
                    >
                    <Text style={styles.arrowText}>›</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            {currentUser && (
                <View style={styles.weekGridContainer}>
                    <WeekGrid
                        plans={[...(plans[currentUser.id] || [])]}
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
    padding: 8,
  },
  weekGridContainer: {
    flex: 1,
    marginTop: 8,
    marginBottom: 12,

    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E6E9EF",
    borderRadius: 16,
    overflow: "hidden",

    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    // Android shadow
    elevation: 2,

    padding: 5, // Grid 내부 선과 겹치지 않게 최소 패딩
  },
  
    // 가운데 주차 네비게이션
  weekHeader: {
    marginTop: 3,
    marginBottom: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2F2A45",
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6E3F5",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  arrowText: { fontSize: 18, fontWeight: "700", color: "#7C6BD9", marginTop: -2 },
  arrowWrapper: {
    width: 40, // 👈 좌/우 화살표 영역 고정
    alignItems: "center",
  },
});