// src/screens/MohaeyoungScreen.tsx
import PostBottomSheet from "@/components/post/PostBottomSheet";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import FriendsList from "../components/FriendsList";
import TopTabs, { TopTabKey } from "../components/TopTabs";
import WeekGrid from "../components/WeekGrid";
import { useUser } from "../contexts/UserContext";
import { useMohaeyoung } from "../hooks/useMohaeyoungScreen";
import { usePostBottomSheet } from "../hooks/usePostBottomSheet";
import type { PlanEntity } from "../types";
import AccountDetailScreen from "./AccountDetailScreen";
import AccountScreen from "./AccountScreen";
import SavingScreen from "./SavingScreen";

export default function MohaeyoungScreen() {
    const [activeTab, setActiveTab] = useState<TopTabKey>("계좌");
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [showAccountDetail, setShowAccountDetail] = useState(false);
    
    const { loggedUser } = useUser();
    const { currentUser, friends, plans, loading, error, getCurrentWeekRange, refetch, onItemPress, setCurrentUserTo } = useMohaeyoung({
        currentUser: loggedUser ? {
            id: loggedUser.userId,
            name: loggedUser.username,
            email: loggedUser.email,
            imageUrl: loggedUser.imageUrl,
            isNew: false
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

    const handleTabChange = (tab: TopTabKey) => {
        setActiveTab(tab);
        setShowAccountDetail(false);
        setSelectedAccount(null);
    };

    const handleAccountPress = (account: any) => {
        setSelectedAccount(account);
        setShowAccountDetail(true);
    };

    const handleBackToAccounts = () => {
        setShowAccountDetail(false);
        setSelectedAccount(null);
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
    }, [loggedUser, setCurrentUserTo]);

    const renderContent = () => {
        switch (activeTab) {
            case "계좌":
                if (showAccountDetail && selectedAccount) {
                    return <AccountDetailScreen account={selectedAccount} />;
                }
                return <AccountScreen onAccountPress={handleAccountPress} />;
            case "일정":
                return (
                    <View style={styles.weekGridContainer}>
                        {currentUser && (
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
                        )}
                    </View>
                );
            case "저축":
                return <SavingScreen />;
            default:
                return null;
        }
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
            
            {/* TopTabs 추가 */}
            <TopTabs active={activeTab} onChange={handleTabChange} style={styles.topTabs} />
            
            {/* 탭에 따른 콘텐츠 렌더링 */}
            {renderContent()}
            
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
  topTabs: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  weekGridContainer: {
    marginBottom: 60,
    flex: 1,
    padding: 16,
  },
});
