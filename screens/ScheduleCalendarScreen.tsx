import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import EventItem from "../components/EventItem";
import MonthlyCalendar from "../components/MonthlyCalendar";
import TopTabs, { TopTabKey } from "../components/TopTabs";
import { SERVER_URL } from "../constants/server";
import { getToken } from "../contexts/tokenManager";
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
  const { currentUser, plans, setCurrentUserTo, setPlans } = useMohaeyoung({
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
  const [showHeader, setShowHeader] = useState(true);

  // 바텀시트 관련 상태
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [snapPosition, setSnapPosition] = useState<"bottom" | "middle" | "full">("bottom");

  // 바텀시트 애니메이션
  const pan = useRef(new Animated.ValueXY()).current;
  const currentPosition = useRef(0);
  
  // 선택된 날짜의 일정 데이터 상태
  const [selectedDatePlansData, setSelectedDatePlansData] = useState<PlanEntity[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  
  // 계좌 관련 상태
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [selectedPlanForAccount, setSelectedPlanForAccount] = useState<PlanEntity | null>(null);
  const [accountType, setAccountType] = useState<'withdrawal' | 'deposit' | null>(null);

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

  // 선택된 날짜의 일정들 (새로운 API 응답 사용)
  const selectedDatePlans = selectedDatePlansData;

  // 계좌 목록 조회 API
  const fetchAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      console.log("🏦 계좌 목록 조회 시작");
      
      const response = await fetch(`${SERVER_URL}/api/v1/account/simpleList`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`계좌 조회 실패: ${response.status}`);
      }

      const accountsData = await response.json();
      console.log("✅ 계좌 목록 조회 성공:", accountsData);
      
      // API 응답을 EventItem에서 사용할 수 있는 형태로 변환
      const mappedAccounts = accountsData.map((account: any) => ({
        accountNo: account.accountNo,
        accountName: account.accountName,
        accountBalance: account.accountBalance,
      }));
      
      setAccounts(mappedAccounts);
      return mappedAccounts;
    } catch (error) {
      console.error('❌ 계좌 목록 조회 실패:', error);
      return [];
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // 날짜별 일정 조회 API
  const fetchPlansByDate = async (date: Date) => {
    try {
      setIsLoadingPlans(true);
      setPlansError(null);
      
             const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // YYYY-MM-DD 형식 (로컬 시간 기준)
      console.log("📅 날짜별 일정 조회 시작:", dateString);
      
      const response = await fetch(`${SERVER_URL}/api/v1/plans/${dateString}/myPlans`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`일정 조회 실패: ${response.status}`);
      }

      const plansData = await response.json();
      console.log("✅ 날짜별 일정 조회 성공:", plansData);
      console.log("📊 [API Response] 일정 데이터 상세:", JSON.stringify(plansData, null, 2));
      return plansData;
    } catch (error) {
      console.error('❌ 날짜별 일정 조회 실패:', error);
      let errorMessage = '일정을 불러오지 못했습니다.';
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = '인증이 필요합니다. 다시 로그인해 주세요.';
        } else if (error.message.includes('404')) {
          errorMessage = '해당 날짜의 일정을 찾을 수 없습니다.';
        } else if (error.message.includes('500')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        }
      }
      setPlansError(errorMessage);
      return [];
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // 날짜 선택 시 바텀시트 열기
  const handleDateSelect = async (date: Date) => {
    console.log("🔍 handleDateSelect 호출됨, 날짜:", date.toDateString());
    setSelectedDate(date);
    
    // 새로운 API 호출
    const plansData = await fetchPlansByDate(date);
    setSelectedDatePlansData(plansData);
  };

  // 일정 삭제 핸들러
  const handleDeletePlan = async (planId: string) => {
    // 삭제 확인 알림창 표시
    Alert.alert(
      "일정 삭제",
      "정말로 이 일정을 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel",
        },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🗑️ 일정 삭제 시작:", planId);
              
              const response = await fetch(`${SERVER_URL}/api/v1/plans/${planId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${await getToken()}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!response.ok) {
                throw new Error(`일정 삭제 실패: ${response.status} ${response.statusText}`);
              }

              console.log("✅ 일정 삭제 성공:", planId);
              
              // 삭제 성공 후 UI 업데이트
              // plans 상태에서 해당 일정 제거
              setPlans(prev => {
                const updatedPlans = { ...prev };
                Object.keys(updatedPlans).forEach(userId => {
                  const userIdNum = parseInt(userId);
                  if (updatedPlans[userIdNum]) {
                    updatedPlans[userIdNum] = updatedPlans[userIdNum].filter(
                      (plan: PlanEntity) => String(plan.planId) !== planId
                    );
                  }
                });
                return updatedPlans;
              });

              // 삭제 성공 알림
              Alert.alert('성공', '일정이 삭제되었습니다.');

            } catch (error) {
              console.error('❌ 일정 삭제 실패:', error);
              
              let errorMessage = '일정 삭제에 실패했습니다.';
              if (error instanceof Error) {
                if (error.message.includes('401')) {
                  errorMessage = '인증이 필요합니다. 다시 로그인해 주세요.';
                } else if (error.message.includes('404')) {
                  errorMessage = '삭제할 일정을 찾을 수 없습니다.';
                } else if (error.message.includes('403')) {
                  errorMessage = '일정을 삭제할 권한이 없습니다.';
                } else if (error.message.includes('500')) {
                  errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
                }
              }
              
              // 에러 알림 표시
              Alert.alert('오류', errorMessage);
            }
          },
        },
      ]
    );
  };

  // 계좌 선택 핸들러
  const handleAccountSelect = (plan: PlanEntity, type: 'withdrawal' | 'deposit') => {
    setSelectedPlanForAccount(plan);
    setAccountType(type);
    setShowAccountSelector(true);
    fetchAccounts(); // 계좌 목록 가져오기
  };

  // 계좌 선택 완료 핸들러
  const handleAccountConfirm = (selectedAccount: any) => {
    if (selectedPlanForAccount && accountType) {
      // 선택된 계좌 정보를 일정에 업데이트
      const updatedPlans = selectedDatePlansData.map(plan => {
        if (plan.planId === selectedPlanForAccount.planId) {
          return {
            ...plan,
            [accountType === 'withdrawal' ? 'withDrawAccountNo' : 'depositAccountNo']: selectedAccount.accountNo
          };
        }
        return plan;
      });
      setSelectedDatePlansData(updatedPlans);
    }
    setShowAccountSelector(false);
    setSelectedPlanForAccount(null);
    setAccountType(null);
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

  // AddAccountScreen에서 헤더 보이기/숨기기 처리 함수
  const handleAddAccountScreenVisibleHeader = (visible: boolean) => {
    setShowHeader(visible);
  };

  // AccountDetailScreen에서 뒤로 가기 처리 함수
  const handleDetailBackPress = () => {
    // AccountDetailScreen에서 벗어나면 Header 다시 보이기
    setShowHeader(true);
    setShowAccountDetail(false);
    setSelectedAccount(null);
  };

  React.useEffect(() => {
    if (showAccountDetail && selectedAccount) {
      setShowHeader(false);
    }
  }, [showAccountDetail, selectedAccount]);

  const renderContent = () => {
    switch (activeTab) {
      case "계좌":
        if (showAccountDetail && selectedAccount) {
          return <AccountDetailScreen account={selectedAccount} onBackPress={handleDetailBackPress}/>;  // onBack={handleDetailBackPress} />;
        }
        return (
          <View style={{ flex: 1, width: "100%", paddingTop: 8 }}>
            <AccountScreen
              onAccountPress={handleAccountPress}
              visibleHeader={handleAddAccountScreenVisibleHeader}
            />
          </View>
        );
      case "일정":
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}>
      {/* 월간 달력 */}
      <MonthlyCalendar
        monthDate={monthDate}
        selectedDate={selectedDate}
        onChangeMonth={setMonthDate}
        onSelectDate={(d) => {
          console.log("🔍 MonthlyCalendar onSelectDate 호출됨, 날짜:", d.toDateString());
          presentModal();
          handleDateSelect(d);
        }}
        markedDates={marked}
      />

      {/* 날짜 선택 전(바텀시트 안 보일 때) 로고 보여주기 */}
      {!isBottomSheetVisible && (
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/images/MOLI.png")} // ✅ 확장자까지 필요
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>날짜를 선택해 일정을 확인하세요</Text>
        </View>
      )}
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
  const accountSelectorModalRef = useRef<BottomSheetModal>(null);

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
      {showHeader && (
        <View style={styles.header}>
          {/* TopTabs 추가 */}
          <TopTabs active={activeTab} onChange={handleTabChange} style={styles.tabsRow} />
        </View>
      )}

             {/* 탭에 따른 콘텐츠 렌더링 */}
       {renderContent()}

               {/* 계좌 선택 모달 */}
        {showAccountSelector && (
          <BottomSheetModal
            ref={accountSelectorModalRef}
            index={0}
            snapPoints={["60%"]}
            handleIndicatorStyle={{
              backgroundColor: "#000000FF",
              width: 60,
              height: 6,
            }}
            backgroundStyle={styles.bottomSheetBackground}
          >
           <BottomSheetView style={styles.listContainer}>
             <Text style={styles.eventsTitle}>
               {accountType === 'withdrawal' ? '출금' : '입금'} 계좌 선택
             </Text>
             {isLoadingAccounts ? (
               <View style={styles.loadingContainer}>
                 <Text style={styles.loadingText}>계좌 목록을 불러오는 중...</Text>
               </View>
             ) : accounts.length > 0 ? (
               accounts.map((account, index) => (
                 <TouchableOpacity
                   key={account.accountNo || index}
                   style={styles.accountItem}
                   onPress={() => handleAccountConfirm(account)}
                 >
                   <Text style={styles.accountName}>{account.accountName || '계좌명 없음'}</Text>
                   <Text style={styles.accountNumber}>{account.accountNo}</Text>
                 </TouchableOpacity>
               ))
             ) : (
               <View style={styles.emptyEventsContainer}>
                 <Text style={styles.emptyEventsText}>등록된 계좌가 없습니다.</Text>
               </View>
             )}
           </BottomSheetView>
         </BottomSheetModal>
       )}

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

                 {isLoadingPlans ? (
                   <View style={styles.loadingContainer}>
                     <Text style={styles.loadingText}>일정을 불러오는 중...</Text>
                   </View>
                 ) : plansError ? (
                   <View style={styles.errorContainer}>
                     <Text style={styles.errorText}>{plansError}</Text>
                   </View>
                                   ) : selectedDatePlans.length > 0 ? (
                    selectedDatePlans
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((plan, index) => {
                        // EventItem에 전달되는 정보 로깅
                        console.log('📋 [EventItem] 일정 정보:', {
                          planId: plan.planId,
                          title: plan.title,
                          startTime: formatTime(new Date(plan.startTime)),
                          endTime: formatTime(new Date(plan.endTime)),
                          location: plan.place || "장소 없음",
                          hasSavingsGoal: plan.hasSavingsGoal,
                          withdrawalAccount: plan.withDrawAccountNo ? { bankName: "은행명", accountNumber: plan.withDrawAccountNo } : null,
                          depositAccount: plan.depositAccountNo ? { bankName: "은행명", accountNumber: plan.depositAccountNo } : null,
                          rawPlanData: plan // 전체 원본 데이터
                        });
                        
                        return (
                          <EventItem
                            key={plan.planId || index}
                            startTime={formatTime(new Date(plan.startTime))}
                            endTime={formatTime(new Date(plan.endTime))}
                            title={plan.title}
                            location={plan.place || "장소 없음"}
                            hasSavingsGoal={plan.hasSavingsGoal}
                            onDelete={() =>
                              handleDeletePlan(String(plan.planId || ""))
                            }
                            onComplete={() =>
                              handleCompletePlan(String(plan.planId || ""))
                            }
                            withdrawalAccount={plan.withDrawAccountNo ? { bankName: "은행명", accountNumber: plan.withDrawAccountNo } : null}
                            depositAccount={plan.depositAccountNo ? { bankName: "은행명", accountNumber: plan.depositAccountNo } : null}
                            onSelectWithdrawalAccount={() => handleAccountSelect(plan, 'withdrawal')}
                            onSelectDepositAccount={() => handleAccountSelect(plan, 'deposit')}
                          />
                        );
                      })
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#FF4757",
  },
  accountItem: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: "#666",
  },
  topDivider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginBottom: 20,
  },
  logoWrap: {
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 40,
},
logo: {
  width: 160,
  height: 160,
  marginBottom: 12,
  opacity: 0.5,
},
logoText: {
  fontSize: 16,
  color: "#666",
  fontWeight: "500",
},

});
