import { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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

export default function AddAccountScreen({ onProductSelect }: AddAccountScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  // 계좌 생성 API 호출 (임시로 주석 처리)
  const createAccount = async (product: Product) => {
    try {
      console.log('🏦 === 계좌 생성 요청 ===');
      console.log('선택된 상품:', JSON.stringify(product, null, 2));
      
      const response = await fetch(`${SERVER_URL}/api/v1/accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          // 기타 필요한 데이터
        }),
      });

      if (!response.ok) {
        throw new Error(`계좌 생성 요청 실패: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🏦 === 계좌 생성 응답 ===');
      console.log(JSON.stringify(result, null, 2));
      
      return result;
    } catch (error) {
      console.error('❌ 계좌 생성 실패:', error);
      throw error;
    }
  };

  // 상품 선택 처리
  const handleProductSelect = (product: Product) => {
    // 선택된 상품 저장
    setSelectedProduct(product);
    // 커스텀 Alert 표시
    setAlertMessage(`정말로 ${product.productName}의 계좌를 생성하시겠습니까?`);
    setShowCustomAlert(true);
  };

  // 계좌 생성 확인 처리
  const handleConfirmCreateAccount = async () => {
    if (!selectedProduct) return;
    
    try {
      const result = await createAccount(selectedProduct);
      setAlertMessage('계좌가 성공적으로 생성되었습니다!');
      setSelectedProduct(null); // 상품 정보 초기화
      setShowCustomAlert(true);
      // 상품 선택 완료 처리
      onProductSelect(selectedProduct);
    } catch (error) {
      console.error('❌ 계좌 생성 확인 실패:', error);
      
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
      setSelectedProduct(null); // 상품 정보 초기화
      setShowCustomAlert(true);
    }
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

      {/* 커스텀 Alert */}
      {showCustomAlert && (
        <CustomAlert
          visible={showCustomAlert}
          title={selectedProduct ? '계좌 생성 확인' : '알림'}
          message={alertMessage}
          buttons={
            selectedProduct 
              ? [
                  { text: '아니요', onPress: closeCustomAlert, style: 'cancel' },
                  { text: '예', onPress: handleConfirmCreateAccount }
                ]
              : [
                  { text: '확인', onPress: closeCustomAlert }
                ]
          }
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
    paddingTop: 60,
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
});
