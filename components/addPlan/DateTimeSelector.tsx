import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

type Props = {
  selectedDate: string;
  startTime: string;
  endTime: string;
  onDateSelect: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
};

export default function DateTimeSelector({
  selectedDate,
  startTime,
  endTime,
  onDateSelect,
  onStartTimeChange,
  onEndTimeChange,
}: Props) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);

  // 현재 날짜 기준으로 오늘, 내일만 버튼으로 표시
  const quickDates = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date: Date) => {
      const day = date.getDate();
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[date.getDay()];
      return { key: day.toString(), label: `${day} ${weekday}` };
    };

    return [
      formatDate(today),
      formatDate(tomorrow),
    ];
  }, []);

  // 선택된 날짜를 표시할 버튼 데이터
  const selectedDateButton = useMemo(() => {
    if (!selectedDate) return null;
    
    // 오늘/내일 버튼에 포함되지 않은 날짜인 경우
    const today = new Date().getDate().toString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).getDate().toString();
    
    if (selectedDate !== today && selectedDate !== tomorrow) {
      const selectedDateObj = new Date();
      selectedDateObj.setDate(parseInt(selectedDate));
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[selectedDateObj.getDay()];
      return { key: selectedDate, label: `${selectedDate} ${weekday}` };
    }
    
    return null;
  }, [selectedDate]);

  const handleDateSelect = (key: string) => {
    // 오늘/내일 버튼 클릭 시 바로 선택
    onDateSelect(key);
  };

  const handleDatePickerChange = (day: any) => {
    setShowDatePicker(false);
    if (day && day.dateString) {
      const date = new Date(day.dateString);
      const dayOfMonth = date.getDate().toString();
      onDateSelect(dayOfMonth);
    }
  };

  const handleCalendarButtonPress = () => {
    setShowDatePicker(true);
  };

  const handleTimeSelect = (type: 'start' | 'end') => {
    setShowTimePicker(type);
  };

  const handleTimePickerChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(null);
    if (selectedTime) {
      const formattedTime = selectedTime.toTimeString().slice(0, 5);
      if (showTimePicker === 'start') {
        onStartTimeChange(formattedTime);
      } else if (showTimePicker === 'end') {
        onEndTimeChange(formattedTime);
      }
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.label}>날짜</Text>
             <View style={styles.dateContainer}>
         {/* 오늘, 내일 버튼 */}
         {quickDates.map((date) => (
           <TouchableOpacity
             key={date.key}
             style={[
               styles.dateButton,
               selectedDate === date.key && styles.dateButtonActive
             ]}
             onPress={() => handleDateSelect(date.key)}
           >
             <Text style={[
               styles.dateButtonText,
               selectedDate === date.key && styles.dateButtonTextActive
             ]}>
               {date.label}
             </Text>
           </TouchableOpacity>
         ))}
         
         {/* 캘린더로 선택된 날짜 버튼 */}
         {selectedDateButton && (
           <TouchableOpacity
             style={[styles.dateButton, styles.dateButtonActive]}
             onPress={() => handleCalendarButtonPress()}
           >
             <Text style={[styles.dateButtonText, styles.dateButtonTextActive]}>
               {selectedDateButton.label}
             </Text>
           </TouchableOpacity>
         )}
         
         {/* 캘린더 버튼 */}
         <TouchableOpacity
           style={styles.calendarButton}
           onPress={handleCalendarButtonPress}
         >
           <Ionicons name="calendar-outline" size={24} color="#6C5CE7" />
         </TouchableOpacity>
       </View>
      
      <View style={styles.timeContainer}>
        <View style={styles.timeField}>
          <Text style={styles.timeLabel}>From</Text>
          <TouchableOpacity style={styles.timeButton} onPress={() => handleTimeSelect('start')}>
            <Text style={styles.timeText}>{startTime}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.timeArrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
        
        <View style={styles.timeField}>
          <Text style={styles.timeLabel}>To</Text>
          <TouchableOpacity style={styles.timeButton} onPress={() => handleTimeSelect('end')}>
            <Text style={styles.timeText}>{endTime}</Text>
          </TouchableOpacity>
        </View>
      </View>

             {/* 날짜 선택 모달 */}
       <Modal
         visible={showDatePicker}
         transparent={true}
         animationType="fade"
         onRequestClose={() => setShowDatePicker(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>날짜 선택</Text>
               <TouchableOpacity
                 style={styles.closeButton}
                 onPress={() => setShowDatePicker(false)}
               >
                 <Ionicons name="close" size={24} color="#666" />
               </TouchableOpacity>
             </View>
             <Calendar
               onDayPress={handleDatePickerChange}
               markedDates={{
                 [new Date().toISOString().split('T')[0]]: {
                   selected: true,
                   selectedColor: '#6C5CE7',
                 }
               }}
               theme={{
                 selectedDayBackgroundColor: '#6C5CE7',
                 selectedDayTextColor: '#ffffff',
                 todayTextColor: '#6C5CE7',
                 dayTextColor: '#2d4150',
                 textDisabledColor: '#d9e1e8',
                 arrowColor: '#6C5CE7',
                 monthTextColor: '#6C5CE7',
                 indicatorColor: '#6C5CE7',
                 textDayFontWeight: '300',
                 textMonthFontWeight: 'bold',
                 textDayHeaderFontWeight: '300',
                 textDayFontSize: 16,
                 textMonthFontSize: 16,
                 textDayHeaderFontSize: 13
               }}
             />
           </View>
         </View>
       </Modal>

       {/* 시간 선택기 */}
       {showTimePicker && (
         <DateTimePicker
           value={new Date()}
           mode="time"
           display="default"
           onChange={handleTimePickerChange}
         />
       )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dateButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dateButtonTextActive: {
    color: '#fff',
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timeField: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  timeArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
     arrowText: {
     fontSize: 20,
     color: '#666',
   },
   modalOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
     justifyContent: 'center',
     alignItems: 'center',
   },
   modalContent: {
     backgroundColor: 'white',
     borderRadius: 12,
     padding: 20,
     width: '90%',
     maxWidth: 400,
   },
   modalHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 20,
   },
   modalTitle: {
     fontSize: 18,
     fontWeight: '600',
     color: '#333',
   },
   closeButton: {
     padding: 4,
   },
 });
