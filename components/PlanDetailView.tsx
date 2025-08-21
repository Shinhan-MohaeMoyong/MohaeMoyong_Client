import { usePlanDetail } from '@/hooks/usePlanDetail';
import type { PlanEntity } from '@/types/entity/PlanEntity';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  plan: PlanEntity;
};

export default function PlanDetailView({ plan }: Props) {
  const {
    formattedTime,
    formattedDate,
    formattedDuration,
    actionButtons,
  } = usePlanDetail(plan);

  // 정보 행 렌더링
  const renderInfoRow = (icon: string, label: string, value: string) => (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  // 액션 버튼 렌더링
  const renderActionButton = (button: any) => (
    <TouchableOpacity
      key={button.id}
      style={[
        styles.actionButton,
        button.style === 'danger' && styles.deleteButton
      ]}
      onPress={button.onPress}
    >
      <Text style={styles.actionIcon}>{button.icon}</Text>
      <Text style={[
        styles.actionText,
        button.style === 'danger' && styles.deleteText
      ]}>
        {button.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{plan.title}</Text>
      </View>
      
      {/* 일정 정보 */}
      <View style={styles.content}>
        {renderInfoRow('⏰', '시간', formattedTime)}
        {renderInfoRow('📅', '날짜', formattedDate)}
        {renderInfoRow('📍', '장소', plan.place)}
        {renderInfoRow('⏱️', '기간', formattedDuration)}
      </View>
      
      {/* 액션 버튼들 */}
      <View style={styles.actions}>
        {actionButtons.map(renderActionButton)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 18,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 20,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    minWidth: 80,
  },
  actionText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  actionIcon: {
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    color: '#EF4444',
  },
});
