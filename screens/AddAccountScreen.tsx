import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import CustomAlert from '../components/CustomAlert';
import ProductCard from '../components/ProductCard';
import { fetchJson, HttpError } from '../services/api';

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
      const endpoint = '/api/v1/product/list';
      const data = await fetchJson<ProductListItemDTO[]>(endpoint);

      // 백엔드 DTO → 화면용 Entity 매핑
      const mapped: Product[] = data.map((item) => ({
        id: item.accountTypeUniqueNo,
        productName: item.accountName,
        productDescription: item.accountDescription,
        bankName: '신한은행', // 백엔드 응답에 없으므로 고정값/추후 확장
        bankLogo: '신한\n은행', // 단순 표시용
        isExclusive: false, // 응답에 없으므로 기본값
      }));

      setProducts(mapped);
    } catch (error) {
      // 네트워크 실패나 서버 5xx면 빈 목록 유지
      if (
        (error instanceof Error && error.message.includes('Failed to fetch')) ||
        (error instanceof HttpError && error.status >= 500)
      ) {
        setProducts([]);
      } else {
        setProducts([]);
      }
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
    // TODO: 실제 계좌 생성 API 호출로 교체
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, accountId: `ACC_${Date.now()}` });
      }, 1000);
    });
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
      setAlertMessage('계좌 생성에 실패했습니다. 다시 시도해주세요.');
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
