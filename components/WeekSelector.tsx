import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WeekSelectorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function WeekSelector({ selectedDate, onSelectDate }: WeekSelectorProps) {
  // 선택된 날짜가 속한 주의 날짜들을 계산
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = date.getDay();
    startOfWeek.setDate(date.getDate() - day);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      weekDates.push(weekDate);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedDate);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDatePress = (date: Date) => {
    onSelectDate(date);
  };

  return (
    <View style={styles.container}>
      {/* 주간 날짜 목록 */}
      <View style={styles.weekContainer}>
        {weekDates.map((date, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.dateItem}
            onPress={() => handleDatePress(date)}
            activeOpacity={0.7}
          >
            <Text style={styles.weekDay}>{weekDays[index]}</Text>
            <View style={[
              styles.dateNumber,
              isSelected(date) && styles.selectedDate
            ]}>
              <Text style={[
                styles.dateText,
                isSelected(date) && styles.selectedDateText
              ]}>
                {date.getDate()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 16,
    alignItems: 'center',
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
    width: '100%',
  },
  dateItem: {
    alignItems: 'center',
    minWidth: 45,
    marginHorizontal: 6,
  },
  weekDay: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 10,
    fontWeight: '500',
  },
  dateNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDate: {
    backgroundColor: '#8C93FF',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
});
