import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  selectedType: 'group' | 'personal';
  onSelectType: (type: 'group' | 'personal') => void;
};

export default function EventTypeSelector({ selectedType, onSelectType }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>*유형</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'group' && styles.typeButtonActive
          ]}
          onPress={() => onSelectType('group')}
        >
          <Text style={[
            styles.typeButtonText,
            selectedType === 'group' && styles.typeButtonTextActive
          ]}>
            단체 일정
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'personal' && styles.typeButtonActive
          ]}
          onPress={() => onSelectType('personal')}
        >
          <Text style={[
            styles.typeButtonText,
            selectedType === 'personal' && styles.typeButtonTextActive
          ]}>
            개인 일정
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeButtonActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
});
