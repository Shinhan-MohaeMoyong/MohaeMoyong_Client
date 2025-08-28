import { SafeAreaView } from 'react-native-safe-area-context';
import MohaeyoungScreen from '../../screens/MohaeyoungScreen';

export default function TabOneScreen() {
  
  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: -65, backgroundColor: '#fff' }}>
      <MohaeyoungScreen />
    </SafeAreaView>
  );
}