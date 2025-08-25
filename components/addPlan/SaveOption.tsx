import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  isEnabled: boolean;
  onToggle: () => void;
};

export default function SaveOption({ isEnabled, onToggle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>저축하기</Text>
      <TouchableOpacity style={styles.toggleContainer} onPress={onToggle}>
        <View style={[styles.toggleSwitch, isEnabled && styles.toggleSwitchActive]}>
          <View style={[styles.toggleKnob, isEnabled && styles.toggleKnobActive]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleContainer: {
    padding: 4,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',
    position: 'relative',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#6C5CE7',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  toggleKnobActive: {
    left: 22,
  },
});
