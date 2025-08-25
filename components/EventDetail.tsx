import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EventDetailProps {
  startTime: string;
  endTime: string;
  title: string;
  location: string;
  onDelete: () => void;
  onComplete: () => void;
}

export default function EventDetail({
  startTime,
  endTime,
  title,
  location,
  onDelete,
  onComplete
}: EventDetailProps) {
  return (
    <View style={styles.container}>
      {/* 일정 상세 정보 카드 */}
      <View style={styles.eventCard}>
        {/* 상단 행: 시간 정보와 액션 버튼들 */}
        <View style={styles.topRow}>
          {/* 시간 정보 섹션 - 왼쪽 */}
          <View style={styles.timeSection}>
            <Text style={styles.startTime}>{startTime}</Text>
            <Text style={styles.timeSeparator}>~</Text>
            <Text style={styles.endTime}>{endTime}</Text>
          </View>
          
          {/* 액션 버튼들 - 오른쪽 상단 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.buttonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
              <Text style={styles.buttonText}>✓</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* 일정 제목 */}
        <View style={styles.eventRow}>
          <View style={styles.eventIcon}>
            <Text style={styles.iconText}>☰</Text>
          </View>
          <Text style={styles.eventTitle}>{title}</Text>
        </View>
        
        {/* 일정 위치 */}
        <View style={styles.eventRow}>
          <View style={styles.eventIcon}>
            <Text style={styles.iconText}>📍</Text>
          </View>
          <Text style={styles.eventLocation}>{location}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  eventCard: {
    backgroundColor: '#A78BFA',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7C3AED',
  },
  timeSeparator: {
    fontSize: 20,
    color: '#666666',
    marginHorizontal: 12,
  },
  endTime: {
    fontSize: 20,
    color: '#666666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  iconText: {
    fontSize: 20,
    color: '#374151',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  eventLocation: {
    fontSize: 18,
    color: '#FFFFFF',
    flex: 1,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
