import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CustomAlert from "../components/CustomAlert";
import ProductCard from "../components/ProductCard";
import { SERVER_URL } from "../constants/server";
import { clearCreateAccountNo, getCreateAccountNo, getToken, saveCreateAccountNo } from "../contexts/tokenManager";

interface Product {
  id: string;
  productName: string;
  productDescription: string;
  bankName: string;
  isExclusive: boolean;
  exclusiveNote?: string;
  preferentialNote?: string;
}

interface AddAccountScreenProps {
  onProductSelect: (product: Product) => void;
  onBackPress?: () => void;
}

interface ProductListItemDTO {
  accountName: string;
  accountDescription: string;
  accountTypeUniqueNo: string;
}

interface AccountCreationInputModalProps {
  visible: boolean;
  productName: string;
  onConfirm: (accountName: string, targetAmount: string, accountNo: string) => void;
  onCancel: () => void;
}

function AccountCreationInputModal({
  visible,
  productName,
  onConfirm,
  onCancel,
}: AccountCreationInputModalProps) {
  const [accountName, setAccountName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [isValid, setIsValid] = useState(false);

  const formatNumberWithCommas = (value: string): string => {
    const numeric = value.replace(/[^0-9]/g, "");
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleTargetAmountChange = (value: string) => {
    setTargetAmount(formatNumberWithCommas(value));
  };

  useEffect(() => {
    const nameOk = accountName.trim().length > 0 && accountName.trim().length <= 20;
    const numeric = targetAmount.replace(/[^0-9]/g, "");
    const amountOk = numeric.length > 0 && parseInt(numeric, 10) > 0;
    const accountNoOk = accountNo.trim().length > 0;
    setIsValid(nameOk && amountOk && accountNoOk);
  }, [accountName, targetAmount, accountNo]);

  const handleConfirm = () => {
    if (!isValid) return;
    const numeric = targetAmount.replace(/[^0-9]/g, "");
    onConfirm(accountName.trim(), numeric, accountNo.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.handleBar} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>계좌 생성</Text>
            <Text style={styles.modalSubtitle} numberOfLines={2}>
              {productName}
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>계좌 별칭</Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="예) 생활비, 여행적금"
              maxLength={20}
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.helperText}>최대 20자 • 나중에 언제든지 변경할 수 있어요</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>목표 금액</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={targetAmount}
                onChangeText={handleTargetAmountChange}
                placeholder="예) 1,000,000"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
              <View style={styles.suffixPill}>
                <Text style={styles.suffixPillText}>원</Text>
              </View>
            </View>
            <Text style={styles.helperText}>숫자만 입력하면 자동으로 쉼표가 들어가요</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>1원 송금 인증 계좌</Text>
            <TextInput
              style={styles.input}
              value={accountNo}
              onChangeText={setAccountNo}
              placeholder="인증 받을 다른 계좌번호"
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.helperText}>계좌 생성 인증에 사용할 본인 계좌번호를 입력하세요</Text>
          </View>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.btnGhost]}
              onPress={onCancel}
              activeOpacity={0.9}
            >
              <Text style={styles.btnGhostText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.btnPrimary, !isValid && styles.btnDisabled]}
              onPress={handleConfirm}
              disabled={!isValid}
              activeOpacity={0.9}
            >
              <Text style={styles.btnPrimaryText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default function AddAccountScreen({ onProductSelect, onBackPress }: AddAccountScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [query, setQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/v1/product/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("상품 목록 요청 실패");

      const data = await response.json();
      const mapped: Product[] = data.map((item: ProductListItemDTO) => ({
        id: item.accountTypeUniqueNo,
        productName: item.accountName,
        productDescription: item.accountDescription,
        bankName: "신한은행",
        isExclusive: false,
      }));
      setProducts(mapped);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const createAccount = async (product: Product, accountName: string, targetAmount: string, accountNo: string) => {
    const response = await fetch(`${SERVER_URL}/api/v1/account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountName,
        accountTypeUniqueNo: product.id,
        targetAmount: Number(targetAmount),
        accountNo,
      }),
    });
    if (!response.ok) throw new Error("계좌 생성 실패");
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowInputModal(true);
  };

  const handleInputConfirm = async (accountName: string, targetAmount: string, accountNo: string) => {
    setShowInputModal(false);
    if (!selectedProduct) return;
    try {
      await createAccount(selectedProduct, accountName, targetAmount, accountNo);
      await saveCreateAccountNo(accountNo);
      // 생성 요청 후 인증 코드 입력 모달 표시
      setShowAuthModal(true);
    } catch {
      setAlertMessage("계좌 생성 실패");
      setShowCustomAlert(true);
    }
  };

  const handleConfirmCreateAuth = async () => {
    const code = authCode.trim();
    if (code.length !== 4) {
      setAlertMessage("4자리 인증코드를 입력해주세요.");
      setShowCustomAlert(true);
      return;
    }
    setAuthSubmitting(true);
    try {
      const accountNo = await getCreateAccountNo();
      if (!accountNo) throw new Error("세션에 계좌번호가 없습니다.");

      const response = await fetch(`${SERVER_URL}/api/v1/account/auth/create`, {
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
        setAlertMessage(message);
        setShowCustomAlert(true);
        return;
      }

      if (payload && payload.responseCode === "E002") {
        setAlertMessage(payload.responseMessage || "인증 코드가 틀렸습니다.");
        setShowCustomAlert(true);
        return;
      }

      await clearCreateAccountNo();
      setShowAuthModal(false);
      setAuthCode("");
      setAlertMessage("인증에 성공하였습니다.");
      setShowCustomAlert(true);
      // 성공 시 상위에서 목록 갱신을 유도
      if (selectedProduct) onProductSelect(selectedProduct);
    } catch (e) {
      setAlertMessage("인증 처리 중 오류가 발생했습니다.");
      setShowCustomAlert(true);
    } finally {
      setAuthSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.productName, p.productDescription, p.bankName]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [products, query]);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>수시입출금 상품목록</Text>
        </View>

        <Text style={styles.headerSubtitle}>
          필요한 계좌 상품을 선택해서 바로 만들 수 있어요
        </Text>

        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="상품명/설명/은행명으로 검색"
            placeholderTextColor="#9CA3AF"
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setQuery("")}>
              <Text style={styles.clearBtnText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#8B5CF6" style={{ marginTop: 40 }} />
        ) : filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              productName={product.productName}
              productDescription={product.productDescription}
              bankName={product.bankName}
              isExclusive={product.isExclusive}
              onPress={() => handleProductSelect(product)}
              style={{ marginBottom: 16 }}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🫧</Text>
            <Text style={styles.emptyTitle}>표시할 상품이 없어요</Text>
            <Text style={styles.emptyDesc}>검색어나 조건을 다시 확인해 주세요.</Text>
          </View>
        )}
      </ScrollView>

      {showInputModal && selectedProduct && (
        <AccountCreationInputModal
          visible={showInputModal}
          productName={selectedProduct.productName}
          onConfirm={handleInputConfirm}
          onCancel={() => setShowInputModal(false)}
        />
      )}

      {/* 생성 인증 코드 입력 모달 */}
      <Modal
        visible={showAuthModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.handleBar} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>인증 코드 입력</Text>
              <Text style={styles.modalSubtitle}>문자로 받은 4자리 코드를 입력하세요</Text>
            </View>
            <TextInput
              style={styles.input}
              value={authCode}
              onChangeText={(t) => setAuthCode(t.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="4자리 코드"
              keyboardType="number-pad"
              maxLength={4}
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.btnGhost]}
                onPress={() => setShowAuthModal(false)}
                activeOpacity={0.9}
              >
                <Text style={styles.btnGhostText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.btnPrimary]}
                onPress={handleConfirmCreateAuth}
                disabled={authSubmitting}
                activeOpacity={0.9}
              >
                <Text style={styles.btnPrimaryText}>{authSubmitting ? '확인 중...' : '확인'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showCustomAlert && (
        <CustomAlert
          visible={showCustomAlert}
          title="알림"
          message={alertMessage}
          buttons={[{ text: "확인", onPress: () => setShowCustomAlert(false) }]}
          onClose={() => setShowCustomAlert(false)}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    justifyContent: "flex-start",
  },
  headerTop: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start", 
  minHeight: 44,
  position: "relative",
  },
  backButton: { padding: 4, zIndex: 1 }, 
  backButtonText: { fontSize: 22, color: "black" },

  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 23,
    fontWeight: "900",
    color: "#111827",
  },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 8 ,textAlign: "center",},
  searchBar: { position: "relative" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    paddingRight: 40,
    fontSize: 15,
    color: "#111827",
  },
  clearBtn: {
    position: "absolute",
    right: 8,
    top: 6,
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: { fontSize: 16, color: "#8C93FF" },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  emptyWrap: { alignItems: "center", paddingVertical: 64 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#374151", marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: "#6B7280", textAlign: "center", paddingHorizontal: 20 },

  // 모달 스타일들 그대로 유지...
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  handleBar: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },
  modalHeader: { alignItems: "center", marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#0B1220" },
  modalSubtitle: { marginTop: 6, fontSize: 14, color: "#6B7280", textAlign: "center" },
  inputContainer: { marginTop: 16 },
  inputLabel: { fontSize: 13, fontWeight: "800", marginBottom: 8, color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  suffixPill: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#E5E7FF",
  },
  suffixPillText: { fontSize: 13, fontWeight: "800", color: "#4F46E5" },
  helperText: { marginTop: 6, fontSize: 12, color: "#9CA3AF" },
  modalButtonRow: { flexDirection: "row", marginTop: 22 },
  modalButton: { flex: 1, paddingVertical: 13, borderRadius: 12 },
  btnGhost: {
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  btnGhostText: { color: "#374151", textAlign: "center", fontWeight: "800" },
  btnPrimary: {
    backgroundColor: "#8C93FF",
    marginLeft: 8,
    shadowColor: "#8C93FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  btnPrimaryText: { color: "#FFF", textAlign: "center", fontWeight: "900" },
  btnDisabled: { backgroundColor: "#D1D5DB", shadowOpacity: 0 },
});
