import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  isPublic: boolean;
  onTogglePublic: () => void;
};

export default function AddPlanHeader({ isPublic, onTogglePublic }: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      
      <Text style={styles.title}>일정 추가하기</Text>
      
      <TouchableOpacity style={styles.publicToggle} onPress={onTogglePublic}>
        <Text style={styles.publicText}>
          {isPublic ? '공개' : '비공개'}
        </Text>
        <View style={[styles.toggleSwitch, isPublic && styles.toggleSwitchActive]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  publicToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  publicText: {
    fontSize: 14,
    color: '#666',
  },
  toggleSwitch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    position: 'relative',
  },
  toggleSwitchActive: {
    backgroundColor: '#6C5CE7',
  },
});
