import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export type RepeatConfig = {
  enabled: boolean;
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  byDays: string[];
  until: string | null;
  count: number | null;
  exceptions: string[] | null;
};

type Props = {
  selectedOption: string;
  onOptionChange: (option: string) => void;
  repeatConfig?: RepeatConfig;
  onRepeatConfigChange?: (config: RepeatConfig) => void;
};

export default function RepeatOption({ 
  selectedOption, 
  onOptionChange, 
  repeatConfig = { 
    enabled: false, 
    freq: 'WEEKLY', 
    interval: 1, 
    byDays: [], 
    until: null, 
    count: null, 
    exceptions: null 
  },
  onRepeatConfigChange 
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [localConfig, setLocalConfig] = useState<RepeatConfig>(repeatConfig);

  const handleSave = () => {
    if (onRepeatConfigChange) {
      onRepeatConfigChange(localConfig);
    }
    
    // 반복 설정에 따라 표시 텍스트 업데이트
    if (!localConfig.enabled) {
      onOptionChange('안함');
    } else {
      const freqText = {
        DAILY: '일',
        WEEKLY: '주',
        MONTHLY: '개월',
        YEARLY: '년'
      }[localConfig.freq];
      onOptionChange(`${localConfig.interval}${freqText}마다`);
    }
    
    setShowModal(false);
  };

  const handleCancel = () => {
    setLocalConfig(repeatConfig);
    setShowModal(false);
  };

  const handleRepeatToggle = () => {
    const newEnabled = !localConfig.enabled;
    setLocalConfig({ ...localConfig, enabled: newEnabled });
    
    if (onRepeatConfigChange) {
      onRepeatConfigChange({ ...localConfig, enabled: newEnabled });
    }
    
    // 반복 설정에 따라 표시 텍스트 업데이트
    if (!newEnabled) {
      onOptionChange('안함');
    } else {
      const freqText = {
        DAILY: '일',
        WEEKLY: '주',
        MONTHLY: '개월',
        YEARLY: '년'
      }[localConfig.freq];
      onOptionChange(`${localConfig.interval}${freqText}마다`);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>반복</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleSwitch, localConfig.enabled && styles.toggleSwitchActive]}
            onPress={handleRepeatToggle}
          >
            <View style={[styles.toggleKnob, localConfig.enabled && styles.toggleKnobActive]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => setShowModal(true)}>
            <Text style={styles.optionText}>{selectedOption}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>반복 설정</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* 반복 설정 */}
              {localConfig.enabled && (
                <>
                  {/* 반복 주기 선택 - 드롭다운 */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>반복 주기</Text>
                    <View style={styles.dropdownContainer}>
                      <Picker
                        selectedValue={localConfig.freq}
                        onValueChange={(value) => setLocalConfig({ ...localConfig, freq: value })}
                        style={styles.dropdown}
                        itemStyle={styles.dropdownItem}
                      >
                        <Picker.Item label="매일" value="DAILY" />
                        <Picker.Item label="매주" value="WEEKLY" />
                        <Picker.Item label="매월" value="MONTHLY" />
                        <Picker.Item label="매년" value="YEARLY" />
                      </Picker>
                    </View>
                  </View>

                  {/* 반복 간격 설정 - 숫자 입력 */}
                  <View style={[styles.section, styles.intervalSection]}>
                    <Text style={styles.sectionTitle}>반복 간격</Text>
                    <View style={styles.intervalInputContainer}>
                      <Text style={styles.intervalLabel}>매</Text>
                      <TextInput
                        style={styles.intervalTextInput}
                        value={localConfig.interval.toString()}
                        onChangeText={(text) => {
                          const num = parseInt(text) || 1;
                          setLocalConfig({ ...localConfig, interval: Math.max(1, Math.min(10, num)) });
                        }}
                        keyboardType="numeric"
                        placeholder="1"
                        placeholderTextColor="#999"
                      />
                      <Text style={styles.intervalLabel}>
                        {localConfig.freq === 'DAILY' ? '일' : 
                         localConfig.freq === 'WEEKLY' ? '주' : 
                         localConfig.freq === 'MONTHLY' ? '개월' : '년'}
                      </Text>
                      <Text style={styles.intervalLabel}>마다</Text>
                    </View>
                  </View>

                  {/* 요일 선택 (주 단위일 때만) */}
                  {localConfig.freq === 'WEEKLY' && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>반복 요일</Text>
                      <View style={styles.daysContainer}>
                        {[
                          { key: 'MO', label: '월' },
                          { key: 'TU', label: '화' },
                          { key: 'WE', label: '수' },
                          { key: 'TH', label: '목' },
                          { key: 'FR', label: '금' },
                          { key: 'SA', label: '토' },
                          { key: 'SU', label: '일' }
                        ].map((day) => (
                          <TouchableOpacity
                            key={day.key}
                            style={[
                              styles.dayButton,
                              localConfig.byDays.includes(day.key) && styles.dayButtonActive
                            ]}
                            onPress={() => {
                              const newByDays = localConfig.byDays.includes(day.key)
                                ? localConfig.byDays.filter(d => d !== day.key)
                                : [...localConfig.byDays, day.key];
                              setLocalConfig({ ...localConfig, byDays: newByDays });
                            }}
                          >
                            <Text style={[
                              styles.dayButtonText,
                              localConfig.byDays.includes(day.key) && styles.dayButtonTextActive
                            ]}>
                              {day.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* 종료 조건 설정 */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>종료 조건</Text>
                    <View style={styles.endConditionContainer}>
                      <TouchableOpacity
                        style={[
                          styles.endConditionButton,
                          localConfig.until === null && localConfig.count === null && styles.endConditionButtonActive
                        ]}
                        onPress={() => setLocalConfig({ ...localConfig, until: null, count: null })}
                      >
                        <Text style={[
                          styles.endConditionButtonText,
                          localConfig.until === null && localConfig.count === null && styles.endConditionButtonTextActive
                        ]}>
                          종료 없음
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.endConditionButton,
                          localConfig.until !== null && styles.endConditionButtonActive
                        ]}
                        onPress={() => setLocalConfig({ ...localConfig, until: '2025-12-31', count: null })}
                      >
                        <Text style={[
                          styles.endConditionButtonText,
                          localConfig.until !== null && styles.endConditionButtonTextActive
                        ]}>
                          종료일 설정
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.endConditionButton,
                          localConfig.count !== null && styles.endConditionButtonActive
                        ]}
                        onPress={() => setLocalConfig({ ...localConfig, until: null, count: 3 })}
                      >
                        <Text style={[
                          styles.endConditionButtonText,
                          localConfig.count !== null && styles.endConditionButtonTextActive
                        ]}>
                          횟수 설정
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* 종료일 입력 */}
                    {localConfig.until !== null && (
                      <View style={styles.dateInputContainer}>
                        <Text style={styles.dateInputLabel}>종료일:</Text>
                        <TouchableOpacity
                          style={styles.dateButton}
                          onPress={() => {
                            // TODO: 달력 모달 열기
                            console.log('달력 열기');
                            // 여기에 실제 달력 모달을 띄우는 로직 추가
                            // 예: showDatePicker 또는 커스텀 달력 모달
                          }}
                        >
                          <Text style={styles.dateButtonText}>
                            {localConfig.until || '날짜 선택'}
                          </Text>
                          <Ionicons name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* 횟수 입력 */}
                    {localConfig.count !== null && (
                      <View style={styles.countInputContainer}>
                        <Text style={styles.countInputLabel}>반복 횟수:</Text>
                        <TextInput
                          style={styles.countTextInput}
                          value={localConfig.count?.toString() || ''}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 1;
                            setLocalConfig({ ...localConfig, count: Math.max(1, Math.min(10, num)) });
                          }}
                          keyboardType="numeric"
                          placeholder="1"
                          placeholderTextColor="#999"
                        />
                      </View>
                    )}
                  </View>

                  {/* 예외일 설정 */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>예외일 설정</Text>
                    <View style={styles.exceptionContainer}>
                      <Text style={styles.exceptionLabel}>반복하지 않을 날짜:</Text>
                      <View style={styles.exceptionDatesContainer}>
                        {localConfig.exceptions?.map((date, index) => (
                          <View key={index} style={styles.exceptionDateItem}>
                            <Text style={styles.exceptionDateText}>{date}</Text>
                            <TouchableOpacity
                              style={styles.removeDateButton}
                              onPress={() => {
                                const newExceptions = localConfig.exceptions?.filter((_, i) => i !== index) || [];
                                setLocalConfig({ ...localConfig, exceptions: newExceptions });
                              }}
                            >
                              <Ionicons name="close-circle" size={20} color="#FF3B30" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                      <TouchableOpacity
                        style={styles.addExceptionButton}
                        onPress={() => {
                          // TODO: 달력 모달 열기
                          console.log('예외일 달력 열기');
                          // 여기에 실제 달력 모달을 띄우는 로직 추가
                          // 예: showDatePicker 또는 커스텀 달력 모달
                          // 선택된 날짜를 exceptions 배열에 추가
                        }}
                      >
                        <Ionicons name="add-circle-outline" size={20} color="#6C5CE7" />
                        <Text style={styles.addExceptionButtonText}>예외일 추가</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#666',
  },
  
  // Modal 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  
  // 섹션 스타일
  section: {
    marginBottom: 24,
  },
  intervalSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  
  // 토글 스타일
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  
  // 드롭다운 스타일
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  dropdown: {
    height: 50,
  },
  dropdownItem: {
    fontSize: 16,
    color: '#333',
  },
  
  // 반복 간격 설정
  intervalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  intervalLabel: {
    fontSize: 16,
    color: '#333',
  },
  intervalTextInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  picker: {
    width: 120,
    height: 120,
  },
  pickerItem: {
    fontSize: 18,
    color: '#333',
  },
  
  // 요일 선택
  daysContainer: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  dayButton: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayButtonActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dayButtonTextActive: {
    color: '#fff',
  },
  
  // 종료 조건 설정
  endConditionContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  endConditionButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  endConditionButtonActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  endConditionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  endConditionButtonTextActive: {
    color: '#fff',
  },
  
  // 날짜 입력
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  dateInputLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  
  // 횟수 입력
  countInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  countInputLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  countTextInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  // 예외일 설정
  exceptionContainer: {
    marginTop: 12,
  },
  exceptionLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
  },
  exceptionDatesContainer: {
    marginBottom: 12,
  },
  exceptionDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exceptionDateText: {
    fontSize: 16,
    color: '#333',
  },
  removeDateButton: {
    padding: 4,
  },
  addExceptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addExceptionButtonText: {
    fontSize: 16,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  
  // 버튼 스타일
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
