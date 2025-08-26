import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WeekSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function WeekSelector({ selectedDate, onSelectDate }: WeekSelectorProps) {
  // 선택된 날짜가 속한 주의 시작일(월요일)과 끝일(일요일) 계산
  const getWeekRange = (date: Date) => {
    const dayOfWeek = date.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일을 주의 시작으로 설정
    
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  };

  const { monday, sunday } = getWeekRange(selectedDate);

  // 주의 모든 날짜 생성
  const getWeekDays = () => {
    const days = [];
    const current = new Date(monday);
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const isSelected = (date: Date) => {
    return selectedDate.toDateString() === date.toDateString();
  };

  const isToday = (date: Date) => {
    return new Date().toDateString() === date.toDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {monday.getMonth() + 1}월 {monday.getDate()}일 - {sunday.getMonth() + 1}월 {sunday.getDate()}일
        </Text>
      </View>
      
      <View style={styles.weekContainer}>
        {weekDays.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayContainer,
              isSelected(date) && styles.selectedDay,
              isToday(date) && styles.todayDay,
            ]}
            onPress={() => onSelectDate(date)}
          >
            <Text style={[
              styles.dayName,
              isSelected(date) && styles.selectedDayText,
              isToday(date) && styles.todayDayText,
            ]}>
              {dayNames[index]}
            </Text>
            <Text style={[
              styles.dayNumber,
              isSelected(date) && styles.selectedDayText,
              isToday(date) && styles.todayDayText,
            ]}>
              {date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  selectedDay: {
    backgroundColor: '#A78BFA',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#A78BFA',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  todayDayText: {
    color: '#A78BFA',
  },
});
