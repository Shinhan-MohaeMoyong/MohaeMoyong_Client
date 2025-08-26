import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Mohaeyoung"
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="Moayoung"
        options={{
          title: '모아영',
        }}
      />
      <Tabs.Screen
        name="Mohaeyoung"
        options={{
          title: '뭐해영',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '프로필',
        }}
      />
    </Tabs>
  );
}
