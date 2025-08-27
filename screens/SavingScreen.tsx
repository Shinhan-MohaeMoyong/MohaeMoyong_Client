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

  // 계좌 선택 처리
  const handleAccountPress = (account: SavingStateDTO) => {
    console.log('👆 [SavingScreen] 계좌 선택됨:', {
      accountAlias: account.accountAlias,
      accountNumber: account.accountNumber,
      balance: account.balance,
      achievementRate: account.achievementRate
    });
    // 계좌 클릭 시 처리 (필요시 구현)
  };

  console.log('📱 [SavingScreen] SavingViewModel 렌더링');
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
