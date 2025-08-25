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

export default function AddAccountScreen({ onProductSelect }: AddAccountScreenProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 임시 데이터 (나중에 백엔드 API로 교체)
  const mockProducts: Product[] = [
    {
      id: '1',
      productName: '모아영!',
      productDescription: '(헤이영 캠퍼스 전용 상품)',
      bankName: '신한 SoL Bank',
      bankLogo: '신한\nSoL\nBank',
      isExclusive: true,
      exclusiveNote: '헤이영 캠퍼스 전용 상품입니다.',
      preferentialNote: '(일정 완료시 우대사항 적용)',
    },
    {
      id: '2',
      productName: '스마트 통장',
      productDescription: '(일반 통장)',
      bankName: '신한은행',
      bankLogo: '신한\n은행',
      isExclusive: false,
    },
    {
      id: '3',
      productName: '청년 우대 통장',
      productDescription: '(20-30대 전용)',
      bankName: '신한은행',
      bankLogo: '신한\n은행',
      isExclusive: false,
    },
  ];

  // 상품 목록 가져오기
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출로 교체
      // const response = await fetch('/api/products');
      // const data = await response.json();
      // setProducts(data);
      
      // 임시로 mock 데이터 사용
      setTimeout(() => {
        setProducts(mockProducts);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('상품 목록을 가져오는데 실패했습니다:', error);
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
    // 
    // const response = await fetch('/api/accounts/create', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${userToken}`, // 사용자 인증 토큰
    //   },
    //   body: JSON.stringify({
    //     productId: product.id,
    //     productName: product.productName,
    //     bankName: product.bankName,
    //     userId: userId, // 현재 로그인한 사용자 ID
    //   }),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || '계좌 생성에 실패했습니다.');
    // }
    // 
    // const result = await response.json();
    // return result;
    
    // 임시로 성공 응답 시뮬레이션
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, accountId: `ACC_${Date.now()}` });
      }, 1000);
    });
  };

  // 상품 선택 처리
  const handleProductSelect = (product: Product) => {
    console.log('상품 선택됨:', product.productName);
    
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
      console.log('계좌 생성 시작:', selectedProduct.productName);
      
      // 계좌 생성 API 호출
      const result = await createAccount(selectedProduct);
      console.log('계좌 생성 성공:', result);
      
      // 성공 메시지 표시
      setAlertMessage('계좌가 성공적으로 생성되었습니다!');
      setSelectedProduct(null); // 상품 정보 초기화
      setShowCustomAlert(true);
      
      // 상품 선택 완료 처리
      onProductSelect(selectedProduct);
      
    } catch (error) {
      console.error('계좌 생성 오류:', error);
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
