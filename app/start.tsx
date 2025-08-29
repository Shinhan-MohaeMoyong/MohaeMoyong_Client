import { router } from 'expo-router';
import LoadingScreen from '../screens/LoadingScreen';
export default function Start() {
  return <LoadingScreen onLoadingComplete={() => {router.push('/Mohaeyoung');}}/>;
}
