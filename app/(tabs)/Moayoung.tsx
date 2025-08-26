import ScheduleCalendarScreen from '@/screens/ScheduleCalendarScreen';
import { StyleSheet, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <ScheduleCalendarScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
