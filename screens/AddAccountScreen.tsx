import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CustomAlert from '../components/CustomAlert';
import ProductCard from '../components/ProductCard';
import { SERVER_URL } from '../constants/server';
import { getToken } from '../contexts/tokenManager';

interface Product {
  id: string;
  productName: string;
  productDescription: string;
  bankName: string;
  bankLogo: string;
  isExclusive: boolean;
  exclusiveNote?: string;
  preferentialNote?: string;
}

interface AddAccountScreenProps {
  onProductSelect: (product: Product) => void;
}

// 백엔드 응답 DTO 타입
interface ProductListItemDTO {
  accountName: string; // 상품명
  accountDescription: string; // 상품 설명
  accountTypeUniqueNo: string; // 상품 고유 번호
}

// 계좌 생성 입력 모달 컴포넌트
interface AccountCreationInputModalProps {
  visible: boolean;
  productName: string;
  onConfirm: (accountName: string, targetAmount: string) => void;
  onCancel: () => void;
}

function AccountCreationInputModal({
  visible,
  productName,
  onConfirm,
  onCancel
}: AccountCreationInputModalProps) {
  const [accountName, setAccountName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isValid, setIsValid] = useState(false);

  // 숫자에 쉼표 추가하는 함수
  const formatNumberWithCommas = (value: string): string => {
    // 숫자가 아닌 문자 제거
    const numericValue = value.replace(/[^0-9]/g, '');
    // 3자리 단위로 쉼표 추가
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 목표금액 입력 처리
  const handleTargetAmountChange = (value: string) => {
    const formattedValue = formatNumberWithCommas(value);
    setTargetAmount(formattedValue);
  };

  React.useEffect(() => {
    const isAccountNameValid = accountName.trim().length > 0 && accountName.trim().length <= 20;
    // 쉼표 제거 후 숫자 검증
    const numericAmount = targetAmount.replace(/[^0-9]/g, '');
    const isTargetAmountValid = numericAmount.length > 0 && parseInt(numericAmount) > 0;
    setIsValid(isAccountNameValid && isTargetAmountValid);
  }, [accountName, targetAmount]);

  const handleConfirm = () => {
    if (!isValid) {
      Alert.alert('입력 오류', '모든 필드를 올바르게 입력해주세요.');
      return;
    }
    // 쉼표 제거 후 숫자만 전달
    const numericAmount = targetAmount.replace(/[^0-9]/g, '');
    onConfirm(accountName.trim(), numericAmount);
  };

  const handleCancel = () => {
    setAccountName('');
    setTargetAmount('');
    setIsValid(false);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>계좌 생성</Text>
          <Text style={styles.modalSubtitle}>{productName}</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>계좌 별칭</Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="계좌 별칭을 입력하세요"
              maxLength={20}
            />
            {accountName.length > 0 && accountName.length > 20 && (
              <Text style={styles.errorText}>계좌 별칭은 20자 이하여야 합니다.</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>목표 금액</Text>
            <TextInput
              style={styles.input}
              value={targetAmount}
              onChangeText={handleTargetAmountChange}
              placeholder="목표 금액을 입력하세요"
              keyboardType="numeric"
            />
            {targetAmount.length > 0 && targetAmount.replace(/[^0-9]/g, '').length === 0 && (
              <Text style={styles.errorText}>숫자만 입력해주세요.</Text>
            )}
          </View>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton, !isValid && styles.disabledButton]}
              onPress={handleConfirm}
              disabled={!isValid}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AddAccountScreen({ onProductSelect }: AddAccountScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);

  // 상품 목록 가져오기
  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('🛍️ === 상품 목록 요청 ===');
      const endpoint = '/api/v1/product/list';
      
      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`상품 목록 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🛍️ === 상품 목록 응답 ===');
      console.log(JSON.stringify(data, null, 2));

      // 백엔드 DTO → 화면용 Entity 매핑
      const mapped: Product[] = data.map((item: ProductListItemDTO) => ({
        id: item.accountTypeUniqueNo,
        productName: item.accountName,
        productDescription: item.accountDescription,
        bankName: '신한은행', // 백엔드 응답에 없으므로 고정값/추후 확장
        bankLogo: '신한\n은행', // 단순 표시용
        isExclusive: false, // 응답에 없으므로 기본값
      }));

      setProducts(mapped);
      console.log('🛍️ === 상품 목록 변환 결과 ===');
      console.log(JSON.stringify(mapped, null, 2));
    } catch (error) {
      console.error('❌ 상품 목록 가져오기 실패:', error);
      
      let errorMessage = '상품 목록을 불러오는데 실패했습니다.';
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = '인증이 필요합니다. 다시 로그인해 주세요.';
        } else if (error.message.includes('404')) {
          errorMessage = '상품 정보를 찾을 수 없습니다.';
        } else if (error.message.includes('500')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        }
      }
      
      // 에러 메시지를 사용자에게 표시하거나 상태로 관리
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 처리
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  // 계좌 생성 API 호출
  const createAccount = async (product: Product, accountName: string, targetAmount: string) => {
    try {
      console.log('🏦 === 계좌 생성 요청 ===');
      console.log('선택된 상품:', JSON.stringify(product, null, 2));
      console.log('계좌 별칭:', accountName);
      console.log('목표 금액:', targetAmount);
      
      const response = await fetch(`${SERVER_URL}/api/v1/account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountName: accountName,
          accountTypeUniqueNo: product.id,
          targetAmount: Number(targetAmount)
        }),
      });

      console.log('🏦 === 응답 정보 ===');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      // 201 Created는 성공을 의미하므로 별도 처리
      if (response.status === 201) {
        console.log('🏦 === 계좌 생성 성공 (201 Created) ===');
        return { success: true, message: '계좌가 성공적으로 생성되었습니다.' };
      }

      // 다른 성공 상태코드들 처리
      if (response.ok) {
        const responseText = await response.text();
        console.log('🏦 === 서버 응답 텍스트 ===');
        console.log('Response Text:', responseText);
        console.log('Response Text Length:', responseText.length);
        
        if (responseText.trim()) {
          const result = JSON.parse(responseText);
          console.log('🏦 === 계좌 생성 응답 ===');
          console.log(JSON.stringify(result, null, 2));
          return result;
        } else {
          console.log('🏦 === 빈 응답 - 성공으로 처리 ===');
          return { success: true, message: '계좌가 성공적으로 생성되었습니다.' };
        }
      }

      // 에러 상태코드 처리
      throw new Error(`계좌 생성 요청 실패: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error('❌ 계좌 생성 실패:', error);
      throw error;
    }
  };

  // 상품 선택 처리
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowInputModal(true);
  };

  // 모달 확인 핸들러
  const handleInputConfirm = async (accountName: string, targetAmount: string) => {
    setShowInputModal(false);
    if (!selectedProduct) return;
    
    try {
      const result = await createAccount(selectedProduct, accountName, targetAmount);
      setAlertMessage('계좌가 성공적으로 생성되었습니다!');
      setShowCustomAlert(true);
      onProductSelect(selectedProduct);
    } catch (error) {
      console.error('❌ 계좌 생성 실패:', error);
      
      let errorMessage = '계좌 생성에 실패했습니다. 다시 시도해주세요.';
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = '인증이 필요합니다. 다시 로그인해 주세요.';
        } else if (error.message.includes('400')) {
          errorMessage = '잘못된 요청입니다. 입력 정보를 확인해 주세요.';
        } else if (error.message.includes('500')) {
          errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
        }
      }
      
      setAlertMessage(errorMessage);
      setShowCustomAlert(true);
    }
  };

  // 모달 취소 핸들러
  const handleInputCancel = () => {
    setShowInputModal(false);
    setSelectedProduct(null);
  };

  // 커스텀 Alert 닫기
  const closeCustomAlert = () => {
    setShowCustomAlert(false);
    setAlertMessage('');
    setSelectedProduct(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>수시입출금 상품목록</Text>
      </View>

      {/* 상품 목록 */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>상품 목록을 불러오는 중...</Text>
          </View>
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              productName={product.productName}
              productDescription={product.productDescription}
              bankName={product.bankName}
              bankLogo={product.bankLogo}
              isExclusive={product.isExclusive}
              exclusiveNote={product.exclusiveNote}
              preferentialNote={product.preferentialNote}
              onPress={() => handleProductSelect(product)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 상품이 없습니다.</Text>
          </View>
        )}
      </ScrollView>

      {/* 계좌 생성 입력 모달 */}
      {showInputModal && selectedProduct && (
        <AccountCreationInputModal
          visible={showInputModal}
          productName={selectedProduct.productName}
          onConfirm={handleInputConfirm}
          onCancel={handleInputCancel}
        />
      )}

      {/* 커스텀 Alert */}
      {showCustomAlert && (
        <CustomAlert
          visible={showCustomAlert}
          title="알림"
          message={alertMessage}
          buttons={[
            { text: '확인', onPress: closeCustomAlert }
          ]}
          onClose={closeCustomAlert}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  // 모달 스타일
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#a78bfa',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});
