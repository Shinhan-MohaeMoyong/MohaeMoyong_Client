import { SERVER_URL } from "@/constants/server";
import { clearFetchAccountNo, getFetchAccountNo, getToken, saveFetchAccountNo } from "@/contexts/tokenManager";
import AddAccountScreen from "@/screens/AddAccountScreen";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AccountCard from "../components/AccountCard";
import { AccountMapper } from "../mappers/AccountMapper";

interface Account {
  id: string;
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
}

interface AccountScreenProps {
  onAccountPress: (account: Account) => void;
  visibleHeader: (visible: boolean) => void;
}

export default function AccountScreen({ onAccountPress, visibleHeader }: AccountScreenProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [inputAccountNo, setInputAccountNo] = useState("");
  const [fetchingCert, setFetchingCert] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // 백엔드 응답 DTO
  interface SimpleAccountDTO {
    accountNo: string;
    accountBalance: number;
    accountName: string;
  }

  // 계좌 목록 가져오기
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      console.log("🏦 === 계좌 목록 요청 ===");
      const endpoint = "/api/v1/account/simpleList";

      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`계좌 목록 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("🏦 === 계좌 목록 응답 ===");
      console.log(JSON.stringify(data, null, 2));

      // DTO → 화면에서 쓰는 Legacy Account로 매핑 (기존 뷰 로직 유지)
      const mapped: Account[] = data.map((item: SimpleAccountDTO) => ({
        id: item.accountNo,
        accountNumber: item.accountNo,
        balance: item.accountBalance,
        accountAlias: item.accountName,
        bankName: "신한은행", // 응답에 없으므로 기본값
      }));

      setAccounts(mapped);
      console.log("🏦 === 계좌 목록 변환 결과 ===");
      console.log(JSON.stringify(mapped, null, 2));
    } catch (error) {
      console.error("❌ 계좌 목록 가져오기 실패:", error);
      Alert.alert("오류", "계좌 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  // 새로운 계좌 추가하기
  const handleAddAccount = () => {
    visibleHeader(false);
    setShowAddAccount(true);
  };

  // 계좌 불러오기 플로우 시작
  const handleFetchAccount = () => {
    setInputAccountNo("");
    setShowFetchModal(true);
  };

  // 1원 송금 인증 받기
  const handleRequestFetchCert = async () => {
    const trimmed = inputAccountNo.trim();
    if (!trimmed) {
      Alert.alert("오류", "계좌번호를 입력해주세요.");
      return;
    }
    setFetchingCert(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/account/fetch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountNo: trimmed }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`요청 실패: ${response.status} ${response.statusText} ${text}`);
      }

      await saveFetchAccountNo(trimmed);
      setShowFetchModal(false);
      setShowAuthModal(true);
    } catch (e) {
      console.error("❌ 계좌 불러오기 요청 실패:", e);
      Alert.alert("오류", "계좌 불러오기 요청에 실패했습니다.");
    } finally {
      setFetchingCert(false);
    }
  };

  // 인증 코드 확인
  const handleConfirmAuthCode = async () => {
    const code = authCode.trim();
    if (code.length !== 4) {
      Alert.alert("오류", "4자리 인증코드를 입력해주세요.");
      return;
    }
    setAuthSubmitting(true);
    try {
      const accountNo = await getFetchAccountNo();
      if (!accountNo) throw new Error("세션에 계좌번호가 없습니다.");

      const response = await fetch(`${SERVER_URL}/api/v1/account/auth/fetch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountNo, authCode: code }),
      });

      const contentType = response.headers.get("content-type") || "";
      let payload: any = null;
      if (contentType.includes("application/json")) {
        try { payload = await response.json(); } catch {}
      } else {
        try { payload = await response.text(); } catch {}
      }

      if (!response.ok) {
        const message = payload?.responseMessage || "인증에 실패했습니다.";
        Alert.alert("오류", message);
        return;
      }

      // 에러 코드 케이스 처리 (200이지만 비즈니스 에러일 수 있음)
      if (payload && payload.responseCode === "E002") {
        Alert.alert("오류", payload.responseMessage || "인증 코드가 틀렸습니다.");
        return;
      }

      await clearFetchAccountNo();
      setShowAuthModal(false);
      setAuthCode("");
      Alert.alert("성공", "인증에 성공하였습니다.");
      // 인증 성공 후 목록 갱신
      fetchAccounts();
    } catch (e) {
      console.error("❌ 인증 코드 확인 실패:", e);
      Alert.alert("오류", "인증 처리 중 오류가 발생했습니다.");
    } finally {
      setAuthSubmitting(false);
    }
  };

  // AddAccountScreen에서 뒤로 가기 처리 함수
  const handleBackAddAccountScreen = () => {
    visibleHeader(true);
    setShowAddAccount(false);
  };

  // 상품 선택 처리
  const handleProductSelect = (product: any) => {
    // 상품 선택 완료 후 AddAccountScreen 닫기
    setShowAddAccount(false);
    visibleHeader(true);
    // 계좌 목록 새로고침 (새로 생성된 계좌 반영)
    fetchAccounts();
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 새로운 계좌 추가 화면이 표시되는 경우
  if (showAddAccount) {
    return (
      <AddAccountScreen
        onProductSelect={handleProductSelect}
        onBackPress={handleBackAddAccountScreen}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>계좌 목록을 불러오는 중...</Text>
          </View>
        ) : accounts.length > 0 ? (
          accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={AccountMapper.fromLegacyAccount(account)}
              onPress={() => onAccountPress(account)}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🫧</Text>
            <Text style={styles.emptyTitle}>등록된 계좌가 없어요</Text>
            <Text style={styles.emptyDesc}>하단 버튼을 눌러 새로운 계좌를 추가해보세요.</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addAccountButton}
          onPress={handleAddAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>새로운 계좌 추가하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fetchAccountButton}
          onPress={handleFetchAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.fetchButtonText}>계좌 불러오기</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 계좌번호 입력 모달 */}
      <Modal visible={showFetchModal} transparent animationType="fade" onRequestClose={() => setShowFetchModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>계좌번호 입력</Text>
            <TextInput
              style={styles.modalInput}
              value={inputAccountNo}
              onChangeText={setInputAccountNo}
              placeholder="계좌번호를 입력하세요"
              keyboardType="number-pad"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowFetchModal(false)}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleRequestFetchCert}
                disabled={fetchingCert}
              >
                <Text style={styles.confirmButtonText}>{fetchingCert ? "요청 중..." : "1원 송금 인증 받기"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 인증 코드 입력 모달 */}
      <Modal visible={showAuthModal} transparent animationType="fade" onRequestClose={() => setShowAuthModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>인증 코드 입력</Text>
            <TextInput
              style={styles.modalInput}
              value={authCode}
              onChangeText={(t) => setAuthCode(t.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="4자리 코드"
              keyboardType="number-pad"
              maxLength={4}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowAuthModal(false)}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmAuthCode}
                disabled={authSubmitting}
              >
                <Text style={styles.confirmButtonText}>{authSubmitting ? "확인 중..." : "확인"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  addAccountButton: {
    backgroundColor: "#A78BFA",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 24,
    alignSelf: "center",
  },
  addButtonIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginRight: 6,
  },
  addButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  fetchAccountButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 12,
    alignSelf: "center",
    minWidth: 200,
  },
  fetchButtonText: {
    fontSize: 15,
    color: "#4B5563",
    fontWeight: "600",
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  confirmButton: {
    backgroundColor: "#A78BFA",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
