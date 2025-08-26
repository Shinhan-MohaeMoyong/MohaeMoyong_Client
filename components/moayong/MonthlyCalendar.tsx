import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MonthlyCalendarProps {
  monthDate: Date;
  selectedDate: Date;
  onChangeMonth: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  markedDates?: Record<string, number>;
}

export default function MonthlyCalendar({
  monthDate,
  selectedDate,
  onChangeMonth,
  onSelectDate,
  markedDates = {},
}: MonthlyCalendarProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    return { daysInMonth, firstDayOfWeek };
  };

  const { daysInMonth, firstDayOfWeek } = getDaysInMonth(monthDate);

  const renderCalendarHeader = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return (
      <View style={styles.headerRow}>
        {days.map((day, index) => (
          <View key={index} style={styles.headerCell}>
            <Text style={styles.headerText}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCalendarDays = () => {
    const days = [];
    const { daysInMonth, firstDayOfWeek } = getDaysInMonth(monthDate);

    // 이전 달의 마지막 날들
    const prevMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push(
        <View key={`prev-${day}`} style={styles.calendarCell}>
          <Text style={styles.otherMonthText}>{day}</Text>
        </View>
      );
    }

    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();
      const hasMark = markedDates[dateKey] && markedDates[dateKey] > 0;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarCell,
            isSelected && styles.selectedCell,
            isToday && styles.todayCell,
          ]}
          onPress={() => onSelectDate(date)}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.selectedText,
              isToday && styles.todayText,
            ]}
          >
            {day}
          </Text>
          {hasMark && (
            <View style={styles.markContainer}>
              <View style={styles.mark} />
            </View>
          )}
        </TouchableOpacity>
      );
    }

    // 다음 달의 첫 날들
    const remainingCells = 42 - days.length; // 6주 * 7일 = 42
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <View key={`next-${day}`} style={styles.calendarCell}>
          <Text style={styles.otherMonthText}>{day}</Text>
        </View>
      );
    }

    return days;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(monthDate);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    onChangeMonth(newMonth);
  };

  return (
    <View style={styles.container}>
      {/* 월 네비게이션 */}
      <View style={styles.navigation}>
        <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {monthDate.getFullYear()}년 {monthDate.getMonth() + 1}월
        </Text>
        <TouchableOpacity onPress={() => changeMonth('next')} style={styles.navButton}>
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* 달력 그리드 */}
      <View style={styles.calendar}>
        {renderCalendarHeader()}
        <View style={styles.calendarGrid}>
          {renderCalendarDays()}
        </View>
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
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  calendar: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedCell: {
    backgroundColor: '#A78BFA',
    borderRadius: 25,
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#A78BFA',
    borderRadius: 25,
  },
  todayText: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  otherMonthText: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  markContainer: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    marginLeft: -2,
  },
  mark: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A78BFA',
  },
});
