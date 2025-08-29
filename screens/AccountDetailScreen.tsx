import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AccountCard from '../components/AccountCard';
import TransactionItem from '../components/TransactionItem';
import { SERVER_URL } from '../constants/server';
import { getToken } from '../contexts/tokenManager';
import { AccountMapper } from '../mappers/AccountMapper';
import { AccountDetailDTO, TransactionDetailDTO } from '../types/dto/AccountDetailDTO';

interface Transaction {
  id: string;
  message: string;
  amount: number;
  type: "deposit" | "withdrawal";
  date: string;
}

interface Account {
  id: string;
  accountNumber: string;
  balance: number;
  accountAlias: string;
  bankName: string;
}

interface AccountDetailProps {
  account: Account;
  achievementRate: number;
  transactions: Transaction[];
}

interface AccountDetailScreenProps {
  account: Account;
  onBackPress?: () => void;
  fallbackPath?: Href;
}

export default function AccountDetailScreen({ account, onBackPress, fallbackPath = "/account-list" as Href }: AccountDetailScreenProps) {
  const router = useRouter(); 
  const [filterType, setFilterType] = useState<"all" | "deposit" | "withdrawal">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [accountDetail, setAccountDetail] = useState<AccountDetailDTO | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [showAliasEditModal, setShowAliasEditModal] = useState(false);
  const [newAccountAlias, setNewAccountAlias] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [currentAccount, setCurrentAccount] = useState<Account>(account);


  const mapTransactionDTOToTransaction = (dto: TransactionDetailDTO, index: number): Transaction => ({
    id: `${dto.transactionDate}_${dto.transactionTime}_${index}`,
    message: dto.transactionSummary,
    amount: dto.transactionBalance,
    type: dto.transactionType === "1" ? "deposit" : "withdrawal",
    date: formatTransactionDate(dto.transactionDate, dto.transactionTime),
  });

  const formatTransactionDate = (date: string, time: string): string => {
    const year = date.substring(0, 4);
    const month = date.substring(4, 6);
    const day = date.substring(6, 8);
    const hour = time.substring(0, 2);
    const minute = time.substring(2, 4);
    return `${year}-${month}-${day} ${hour}:${minute}`;
  };

  // 목표 금액 수정 함수
  const updateTargetAmount = async (newTargetAmount: number) => {
    try {
      console.log('🎯 === 목표 금액 수정 요청 ===');
      console.log('📋 계좌번호:', account.accountNumber);
      console.log('📋 새로운 목표 금액:', newTargetAmount);
      
      const response = await fetch(`${SERVER_URL}/api/v1/account/targetAmount`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNo: account.accountNumber,
          targetAmount: newTargetAmount,
        }),
      });

      if (!response.ok) {
        throw new Error(`목표 금액 수정 실패: ${response.status} ${response.statusText}`);
      }

      const result = await response.text();
      console.log('✅ 목표 금액 수정 완료:', result);
      
      // 성공 시 계좌 상세 정보를 다시 불러와서 화면 업데이트
      await fetchDetail();
      
      Alert.alert('성공', '목표 금액이 수정되었습니다.');
    } catch (error) {
      console.error('❌ 목표 금액 수정 실패:', error);
      Alert.alert('오류', '목표 금액 수정에 실패했습니다.');
    }
  };

  // 목표 금액 수정 버튼 클릭 처리
  const handleTargetAmountEdit = () => {
    setNewTargetAmount(accountDetail?.targetAmount?.toString() || '');
    setShowEditModal(true);
  };

  // 목표 금액 수정 확인
  const handleConfirmEdit = () => {
    const newAmount = parseInt(newTargetAmount.replace(/[^0-9]/g, ''));
    if (newAmount > 0) {
      updateTargetAmount(newAmount);
      setShowEditModal(false);
    } else {
      Alert.alert('오류', '올바른 금액을 입력해주세요.');
    }
  };

  // 목표 금액 수정 취소
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setNewTargetAmount('');
  };

  // 계좌 별칭 수정 함수
  const updateAccountAlias = async (newAlias: string) => {
    try {
      console.log('🏷️ === 계좌 별칭 수정 요청 ===');
      console.log('📋 계좌번호:', account.accountNumber);
      console.log('📋 새로운 별칭:', newAlias);
      
      const response = await fetch(`${SERVER_URL}/api/v1/account/accountAlias`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountNo: account.accountNumber,
          accountAlias: newAlias,
        }),
      });

      if (!response.ok) {
        throw new Error(`계좌 별칭 수정 실패: ${response.status} ${response.statusText}`);
      }

      const result = await response.text();
      console.log('✅ 계좌 별칭 수정 완료:', result);
      
      // 성공 시 계좌 상세 정보를 다시 불러와서 화면 업데이트
      await fetchDetail();
      
      Alert.alert('성공', '계좌 별칭이 수정되었습니다.');
    } catch (error) {
      console.error('❌ 계좌 별칭 수정 실패:', error);
      Alert.alert('오류', '계좌 별칭 수정에 실패했습니다.');
    }
  };

  // 계좌 별칭 수정 버튼 클릭 처리
  const handleAliasEdit = () => {
    setNewAccountAlias(accountDetail?.accountName || '');
    setShowAliasEditModal(true);
  };

  // 계좌 별칭 수정 확인
  const handleConfirmAliasEdit = () => {
    if (newAccountAlias.trim()) {
      updateAccountAlias(newAccountAlias.trim());
      setShowAliasEditModal(false);
    } else {
      Alert.alert('오류', '계좌 별칭을 입력해주세요.');
    }
  };

  // 계좌 별칭 수정 취소
  const handleCancelAliasEdit = () => {
    setShowAliasEditModal(false);
    setNewAccountAlias('');
  };

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🏦 === 계좌 상세 정보 요청 ===');
      const accountNo = account.accountNumber;
      console.log('📋 요청할 계좌번호:', accountNo);
      console.log('📋 요청 URL:', `${SERVER_URL}/api/v1/account/detail`);
      
      const requestBody = {
        accountNo: accountNo
      };
      console.log('📋 요청 Body:', JSON.stringify(requestBody, null, 2));
      
      // POST 방식으로 API 엔드포인트 호출
      const response = await fetch(`${SERVER_URL}/api/v1/account/detail`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        console.error('❌ HTTP 상태 코드:', response.status);
        console.error('❌ HTTP 상태 텍스트:', response.statusText);
        
        // 에러 응답 본문도 확인
        try {
          const errorResponse = await response.text();
          console.error('❌ 에러 응답 본문:', errorResponse);
        } catch (textError) {
          console.error('❌ 에러 응답 본문 읽기 실패:', textError);
        }
        
        throw new Error(`계좌 상세 정보 요청 실패: ${response.status} ${response.statusText}`);
      }

      const accountDetailResponse = await response.json();
      setAccountDetail(accountDetailResponse);
      setCurrentAccount(prev => ({
        ...prev,
        balance: accountDetailResponse.accountBalance
      }));

      const mappedTransactions = (accountDetailResponse.list ?? []).map(
        (t: TransactionDetailDTO, idx: number) => ({
          id: `${t.transactionDate}_${t.transactionTime}_${idx}`,
          message: t.transactionSummary,
          amount: t.transactionBalance,
          type: t.transactionType === "1" ? "deposit" : "withdrawal",
          date: `${t.transactionDate.slice(0, 4)}-${t.transactionDate.slice(4, 6)}-${t.transactionDate.slice(6, 8)} ${t.transactionTime.slice(0, 2)}:${t.transactionTime.slice(2, 4)}`,
        })
      );
      
      setTransactions(mappedTransactions);
      console.log('🏦 === 거래내역 변환 결과 ===');
      console.log(accountDetailResponse);
      console.log(JSON.stringify(mappedTransactions, null, 2));
      

      
    } catch (e) {
      console.error("❌ 계좌 상세 정보 조회 실패:", e);
      let msg = "계좌 상세 정보를 불러오지 못했습니다.";
      if (e instanceof Error) {
        if (e.message.includes("401")) msg = "인증이 필요합니다. 다시 로그인해 주세요.";
        else if (e.message.includes("404")) msg = "계좌 정보를 찾을 수 없습니다.";
        else if (e.message.includes("500")) msg = "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const next = transactions.filter((t) =>
      filterType === "all" ? true : t.type === filterType
    );
    setFilteredTransactions(next);
  }, [transactions, filterType]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDetail();
    setRefreshing(false);
  };

  React.useEffect(() => {
    fetchDetail();
  }, []);


  const handleBack = () => {
  if (onBackPress) {
    onBackPress();
  }
};

// 내부 함수: 버튼 렌더
  function renderFilterButton(type: "all" | "deposit" | "withdrawal", label: string) {
    const isActive = filterType === type;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilterType(type)}
      >
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  if (loading && !accountDetail) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>계좌 정보를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error && !accountDetail) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDetail}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // ✅ 터치 영역 확장
        >
          <Text style={styles.backButtonText}>←</Text>

        </TouchableOpacity>
        <Text style={styles.headerTitle}>계좌 상세</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* 계좌 정보 카드 */}
        <AccountCard
          account={{
            ...AccountMapper.fromLegacyAccount(currentAccount),
            accountAlias: accountDetail?.accountName || account.accountAlias,
          }}
          onPress={() => {}}
          onAliasEdit={handleAliasEdit}
        />

        

        {/* 내역 구분 필터 */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>내역 구분</Text>
          <View style={styles.filterButtons}>
            {renderFilterButton("all", "전체")}
            {renderFilterButton("deposit", "입금")}
            {renderFilterButton("withdrawal", "출금")}
          </View>
        </View>

       {/* 거래내역 목록 */}
<View style={styles.transactionsContainer}>
  <View style={styles.transactionsHeaderRow}>
    <Text style={styles.transactionsTitleRowText}>거래내역</Text>
    <Text style={styles.transactionsCount}>{filteredTransactions.length}건</Text>
  </View>

  <FlatList
    data={filteredTransactions}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <TransactionItem
        message={item.message}
        amount={item.amount}
        type={item.type}
        date={item.date}
      />
    )}
    ItemSeparatorComponent={() => <View style={styles.itemDivider} />}
    ListEmptyComponent={
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyEmoji}>🫧</Text>
        <Text style={styles.emptyTitle}>표시할 거래내역이 없어요</Text>
        <Text style={styles.emptyDesc}>
          상단에서 필터를 변경하거나 새로고침하여 최신 거래내역을 불러와 보세요.
        </Text>

        <View style={styles.emptyActions}>
          <TouchableOpacity style={styles.emptyPrimaryBtn} onPress={onRefresh}>
            <Text style={styles.emptyPrimaryBtnText}>새로고침</Text>
          </TouchableOpacity>
        </View>
      </View>
    }
    scrollEnabled={false} // 상단 ScrollView와 스크롤 충돌 방지
  />
</View>
      </ScrollView>

      {/* 목표 금액 수정 모달 */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>목표 금액 수정</Text>
            <Text style={styles.modalSubtitle}>새로운 목표 금액을 입력해주세요.</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newTargetAmount}
              onChangeText={setNewTargetAmount}
              placeholder="목표 금액을 입력하세요"
              keyboardType="numeric"
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmEdit}
              >
                <Text style={styles.confirmButtonText}>수정</Text>
              </TouchableOpacity>
            </View>
          </View>
                 </View>
       </Modal>

       {/* 계좌 별칭 수정 모달 */}
       <Modal
         visible={showAliasEditModal}
         transparent={true}
         animationType="fade"
         onRequestClose={handleCancelAliasEdit}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>계좌 별칭 수정</Text>
             <Text style={styles.modalSubtitle}>새로운 계좌 별칭을 입력해주세요.</Text>
             
             <TextInput
               style={styles.modalInput}
               value={newAccountAlias}
               onChangeText={setNewAccountAlias}
               placeholder="계좌 별칭을 입력하세요"
               autoFocus={true}
             />
             
             <View style={styles.modalButtons}>
               <TouchableOpacity
                 style={[styles.modalButton, styles.cancelButton]}
                 onPress={handleCancelAliasEdit}
               >
                 <Text style={styles.cancelButtonText}>취소</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                 style={[styles.modalButton, styles.confirmButton]}
                 onPress={handleConfirmAliasEdit}
               >
                 <Text style={styles.confirmButtonText}>수정</Text>
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
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#A78BFA",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: '600',
  },
  targetAmountContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  targetAmountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  targetAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#A78BFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  filterContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#A78BFA",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  transactionsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 1, // ✅ 제목과 겹침 방지
  },
  backButtonText: { fontSize: 22, color: "black" },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerPlaceholder: {
    width: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#A78BFA',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  transactionsHeaderRow: {
    flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
  },
  transactionsCount: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "600",
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 8,
  },

  // 🫧 빈 상태
  emptyWrap: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8EBFF",
    backgroundColor: "#F7F8FF",
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
  },
  emptyActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  emptyPrimaryBtn: {
    backgroundColor: "#A78BFA",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  emptyPrimaryBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyGhostBtn: {
    backgroundColor: "#EEF0F6",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  emptyGhostBtnText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "700",
  },
  transactionsTitleRowText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 0,   // ✅ 행 안에서 줄바꿈 방지
    flexShrink: 1,     // ✅ 화면 좁아도 줄바꿈 안 되도록
  }
});
