import { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  View
} from 'react-native';
import SavingViewModel from '../components/SavingViewModel';
import { SavingStateDTO } from '../types/dto/SavingDTO';

const { width: screenWidth } = Dimensions.get('window');

export default function SavingScreen() {
  console.log('🎬 [SavingScreen] 화면 렌더링');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [showAccountDetail, setShowAccountDetail] = useState(false);

  // 계좌 선택 처리
  const handleAccountPress = (account: SavingStateDTO) => {
    console.log('👆 [SavingScreen] 계좌 선택됨:', {
      accountAlias: account.accountAlias,
      accountNumber: account.accountNumber,
      balance: account.balance,
      achievementRate: account.achievementRate
    });
    
    // AccountDetailScreen에서 사용할 수 있는 형태로 계좌 정보 변환
    const accountForDetail = {
      id: account.accountNumber,
      accountNumber: account.accountNumber,
      balance: parseInt(account.balance.replace(/[^0-9]/g, '')), // 문자열에서 숫자만 추출
      accountAlias: account.accountAlias,
      bankName: '신한은행', // 기본값
    };
    
    setSelectedAccount(accountForDetail);
    setShowAccountDetail(true);
  };

  // 계좌 상세 화면에서 뒤로가기 처리
  const handleBackFromAccountDetail = () => {
    setShowAccountDetail(false);
    setSelectedAccount(null);
  };

  console.log('📱 [SavingScreen] SavingViewModel 렌더링');
  
  // 계좌 상세 화면이 표시되는 경우

  return (
    <View style={styles.container}>
      <SavingViewModel onAccountPress={handleAccountPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
