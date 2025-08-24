import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  selectedDate: string;
  startTime: string;
  endTime: string;
  onDateSelect: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
};

const dates = [
  { key: '22', label: '22 Fr' },
  { key: '23', label: '23 Sa' },
  { key: '24', label: '24 Su' },
  { key: 'other', label: 'Other Date' },
];

export default function DateTimeSelector({
  selectedDate,
  startTime,
  endTime,
  onDateSelect,
  onStartTimeChange,
  onEndTimeChange,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>날짜</Text>
      <View style={styles.dateContainer}>
        {dates.map((date) => (
          <TouchableOpacity
            key={date.key}
            style={[
              styles.dateButton,
              selectedDate === date.key && styles.dateButtonActive
            ]}
            onPress={() => onDateSelect(date.key)}
          >
            <Text style={[
              styles.dateButtonText,
              selectedDate === date.key && styles.dateButtonTextActive
            ]}>
              {date.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.timeContainer}>
        <View style={styles.timeField}>
          <Text style={styles.timeLabel}>From</Text>
          <TouchableOpacity style={styles.timeButton}>
            <Text style={styles.timeText}>{startTime}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.timeArrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
        
        <View style={styles.timeField}>
          <Text style={styles.timeLabel}>To</Text>
          <TouchableOpacity style={styles.timeButton}>
            <Text style={styles.timeText}>{endTime}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
});
