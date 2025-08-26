import { StyleSheet, Text, View } from 'react-native';
import EventBlock from './EventBlock';

interface Schedule {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
}

interface DailyScheduleListProps {
  date: Date;
  schedules: Schedule[];
  onSchedulePress?: (schedule: Schedule) => void;
}

export default function DailyScheduleList({ date, schedules, onSchedulePress }: DailyScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {date.getMonth() + 1}월 {date.getDate()}일에는 일정이 없습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateTitle}>
        {date.getMonth() + 1}월 {date.getDate()}일 일정
      </Text>
      {schedules.map((schedule) => (
        <EventBlock
          key={schedule.id}
          title={schedule.title}
          time={`${schedule.startTime} - ${schedule.endTime}`}
          location={schedule.location}
          onPress={() => onSchedulePress?.(schedule)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
