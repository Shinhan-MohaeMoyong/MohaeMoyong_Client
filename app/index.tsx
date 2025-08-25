import LoadingScreen from '@/screens/LoadingScreen';
import ScheduleCalendarScreen from '@/screens/ScheduleCalendarScreen';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const { isLoggedIn } = useUser();

  useEffect(() => {
    // 로딩 화면을 3초간 보여주고 메인 화면으로 전환
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // // 로딩 중이거나 로그인이 안 된 경우 로딩 화면 표시
   if (isLoading || !isLoggedIn) {
     return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
   }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScheduleCalendarScreen />
      {/* <LoadingScreen />
      <MohaeyoungScreen /> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
