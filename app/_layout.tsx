import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from '../contexts/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar style="dark" backgroundColor="#fff" />
            <Stack
              screenOptions={{
                headerShown: false,
                // 모든 스크린 기본 배경 흰색
                contentStyle: { backgroundColor: '#fff' },
                statusBarTranslucent: false
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="start" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="add-plan" />
              <Stack.Screen name="account-select" />
            </Stack>
          </View>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </UserProvider>
  );
}
