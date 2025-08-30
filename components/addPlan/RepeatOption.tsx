import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

export type RepeatConfig = {
  enabled: boolean;
  freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  byDays: string[];
  until: string | null;
  count: number | null;
  exceptions: string[] | null;
};

type Props = {
  repeatConfig?: RepeatConfig;
  onRepeatConfigChange?: (config: RepeatConfig) => void;
};

export default function RepeatOption({
  repeatConfig = {
    enabled: false,
    freq: "WEEKLY",
    interval: 1,
    byDays: [],
    until: null,
    count: null,
    exceptions: null,
  },
  onRepeatConfigChange,
}: Props) {
  // 내부 로컬 상태 (초기값만 props로부터 주입)
  const [localConfig, setLocalConfig] = useState<RepeatConfig>(repeatConfig);

  // 입력 중 빈 문자열을 표시하기 위한 로컬 텍스트 상태
  const [intervalText, setIntervalText] = useState<string>(String(repeatConfig.interval ?? 1));
  const [countText, setCountText] = useState<string>(
    repeatConfig.count === null || repeatConfig.count === undefined ? "" : String(repeatConfig.count)
  );

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showExceptionDatePicker, setShowExceptionDatePicker] = useState(false);

  const emitChange = (cfg: RepeatConfig) => {
    setLocalConfig(cfg);
    onRepeatConfigChange?.(cfg);
  };

  const handleRepeatToggle = () => {
    const newEnabled = !localConfig.enabled;
    emitChange({ ...localConfig, enabled: newEnabled });
  };

  const updateConfig = (updates: Partial<RepeatConfig>) => {
    emitChange({ ...localConfig, ...updates });
  };

  const handleEndDatePickerChange = (day: any) => {
    setShowEndDatePicker(false);
    if (day?.dateString) updateConfig({ until: day.dateString, count: null });
  };

  const handleExceptionDatePickerChange = (day: any) => {
    setShowExceptionDatePicker(false);
    if (day?.dateString) {
      const newExceptions = localConfig.exceptions ? [...localConfig.exceptions, day.dateString] : [day.dateString];
      updateConfig({ exceptions: newExceptions });
    }
  };

  // 숫자만 추출
  const onlyDigits = (s: string) => s.replace(/[^\d]/g, "");

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.label}>반복</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleSwitch, localConfig.enabled && styles.toggleSwitchActive]}
            onPress={handleRepeatToggle}
          >
            <View style={[styles.toggleKnob, localConfig.enabled && styles.toggleKnobActive]} />
          </TouchableOpacity>
        </View>
      </View>

      {localConfig.enabled && (
        <View style={styles.settingsContainer}>
          {/* 반복 주기 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>반복 주기</Text>
            <View style={styles.freqContainer}>
              {[
                { key: "DAILY", label: "매일" },
                { key: "WEEKLY", label: "매주" },
                { key: "MONTHLY", label: "매월" },
                { key: "YEARLY", label: "매년" },
              ].map((freq) => (
                <TouchableOpacity
                  key={freq.key}
                  style={[
                    styles.freqButton,
                    localConfig.freq === freq.key && styles.freqButtonActive,
                  ]}
                  onPress={() => updateConfig({ freq: freq.key as RepeatConfig["freq"] })}
                >
                  <Text
                    style={[
                      styles.freqButtonText,
                      localConfig.freq === freq.key && styles.freqButtonTextActive,
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 반복 간격 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>반복 간격</Text>
            <View style={styles.intervalInputContainer}>
              <Text style={styles.intervalLabel}>매</Text>
              <TextInput
                style={styles.intervalTextInput}
                value={intervalText}
                onChangeText={(text) => {
                  // 입력 중에는 빈 문자열 허용
                  const digits = onlyDigits(text);
                  if (text === "") {
                    setIntervalText("");
                    return;
                  }
                  setIntervalText(digits);
                  const num = parseInt(digits, 10);
                  if (!Number.isNaN(num)) {
                    const clamped = Math.max(1, Math.min(10, num));
                    updateConfig({ interval: clamped });
                  }
                }}
                onBlur={() => {
                  // 비워둔 채 포커스 아웃 → 기본 1로 확정
                  if (intervalText === "") {
                    setIntervalText("1");
                    updateConfig({ interval: 1 });
                  } else {
                    const num = parseInt(intervalText, 10);
                    const clamped = Number.isNaN(num) ? 1 : Math.max(1, Math.min(10, num));
                    setIntervalText(String(clamped));
                    updateConfig({ interval: clamped });
                  }
                }}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor="#999"
              />
              <Text style={styles.intervalLabel}>
                {localConfig.freq === "DAILY"
                  ? "일"
                  : localConfig.freq === "WEEKLY"
                  ? "주"
                  : localConfig.freq === "MONTHLY"
                  ? "개월"
                  : "년"}
              </Text>
              <Text style={styles.intervalLabel}>마다</Text>
            </View>
          </View>

          {/* 요일 (주 단위) */}
          {localConfig.freq === "WEEKLY" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>반복 요일</Text>
              <View style={styles.daysContainer}>
                {[
                  { key: "MO", label: "월" },
                  { key: "TU", label: "화" },
                  { key: "WE", label: "수" },
                  { key: "TH", label: "목" },
                  { key: "FR", label: "금" },
                  { key: "SA", label: "토" },
                  { key: "SU", label: "일" },
                ].map((day) => {
                  const active = localConfig.byDays.includes(day.key);
                  return (
                    <TouchableOpacity
                      key={day.key}
                      style={[styles.dayButton, active && styles.dayButtonActive]}
                      onPress={() => {
                        const newByDays = active
                          ? localConfig.byDays.filter((d) => d !== day.key)
                          : [...localConfig.byDays, day.key];
                        updateConfig({ byDays: newByDays });
                      }}
                    >
                      <Text style={[styles.dayButtonText, active && styles.dayButtonTextActive]}>
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* 종료 조건 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>종료 조건</Text>
            <View style={styles.endConditionContainer}>
              

              <TouchableOpacity
                style={[
                  styles.endConditionButton,
                  localConfig.until !== null && styles.endConditionButtonActive,
                ]}
                onPress={() => {
                  updateConfig({ until: "2025-12-31", count: null });
                  setCountText("");
                }}
              >
                <Text
                  style={[
                    styles.endConditionButtonText,
                    localConfig.until !== null && styles.endConditionButtonTextActive,
                  ]}
                >
                  종료일 설정
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.endConditionButton,
                  localConfig.count !== null && styles.endConditionButtonActive,
                ]}
                onPress={() => {
                  const next = localConfig.count ?? 1;
                  updateConfig({ until: null, count: next });
                  setCountText(String(next));
                }}
              >
                <Text
                  style={[
                    styles.endConditionButtonText,
                    localConfig.count !== null && styles.endConditionButtonTextActive,
                  ]}
                >
                  횟수 설정
                </Text>
              </TouchableOpacity>
            </View>

            {/* 종료일 입력 */}
            {localConfig.until !== null && (
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateInputLabel}>종료일:</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndDatePicker(true)}>
                  <Text style={styles.dateButtonText}>{localConfig.until || "날짜 선택"}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            
            {/* 횟수 입력 */}
            {(
              <View style={styles.countInputContainer}>
                <Text style={styles.countInputLabel}>반복 횟수:</Text>
                <TextInput
                  style={styles.countTextInput}
                  value={countText}
                  onChangeText={(text) => {
                    const digits = onlyDigits(text);
                    if (text === "") {
                      setCountText("");        // 입력 중 빈 문자열 허용
                      updateConfig({ count: null });
                      return;
                    }
                    setCountText(digits);
                    const num = parseInt(digits, 10);
                    if (!Number.isNaN(num)) {
                      const clamped = Math.max(1, Math.min(99, num));
                      updateConfig({ count: clamped });
                    }
                  }}
                  
                  keyboardType="number-pad"
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
                  <View key={`${date}-${index}`} style={styles.exceptionDateItem}>
                    <Text style={styles.exceptionDateText}>{date}</Text>
                    <TouchableOpacity
                      style={styles.removeDateButton}
                      onPress={() => {
                        const newExceptions = (localConfig.exceptions ?? []).filter((_, i) => i !== index);
                        updateConfig({ exceptions: newExceptions.length ? newExceptions : null });
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={styles.addExceptionButton}
                onPress={() => setShowExceptionDatePicker(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color="#6C5CE7" />
                <Text style={styles.addExceptionButtonText}>예외일 추가</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 종료일 모달 */}
      <Modal
        visible={showEndDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>종료일 선택</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowEndDatePicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleEndDatePickerChange}
              markedDates={
                localConfig.until
                  ? { [localConfig.until]: { selected: true, selectedColor: "#6C5CE7" } }
                  : {}
              }
              theme={{
                selectedDayBackgroundColor: "#6C5CE7",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#6C5CE7",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                arrowColor: "#6C5CE7",
                monthTextColor: "#6C5CE7",
                indicatorColor: "#6C5CE7",
                textDayFontWeight: "300",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "300",
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
            />
          </View>
        </View>
      </Modal>

      {/* 예외일 모달 */}
      <Modal
        visible={showExceptionDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExceptionDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>예외일 선택</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowExceptionDatePicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={handleExceptionDatePickerChange}
              markedDates={{
                ...(localConfig.exceptions?.reduce<Record<string, any>>((acc, date) => {
                  acc[date] = { selected: true, selectedColor: "#FF3B30" };
                  return acc;
                }, {}) ?? {}),
              }}
              theme={{
                selectedDayBackgroundColor: "#FF3B30",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#6C5CE7",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                arrowColor: "#6C5CE7",
                monthTextColor: "#6C5CE7",
                indicatorColor: "#6C5CE7",
                textDayFontWeight: "300",
                textMonthFontWeight: "bold",
                textDayHeaderFontWeight: "300",
                textDayFontSize: 16,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 13,
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "#fff", // 흰색 배경
    borderWidth: 1, // 테두리 두께
    borderColor: "#6C5CE7", // 보라색 테두리
    borderRadius: 12, // 모서리 둥글게 (원하면)
    padding: 12,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ddd",
    position: "relative",
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#FF6B9D",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    position: "absolute",
    top: 2,
    left: 2,
  },
  toggleKnobActive: {
    left: 22,
  },

  // 반복 설정 컨테이너
  settingsContainer: {
    backgroundColor: "#fff",
    // backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    zIndex: 1,
  },

  // 섹션 스타일
  section: {
    marginBottom: 24,
    position: "relative",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },

  // 반복 주기 버튼 스타일
  freqContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  freqButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  freqButtonActive: {
    backgroundColor: "#6C5CE7",
    borderColor: "#6C5CE7",
  },
  freqButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  freqButtonTextActive: {
    color: "#fff",
  },

  // 반복 간격 설정
  intervalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  intervalLabel: {
    fontSize: 16,
    color: "#333",
  },
  intervalTextInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // 요일 선택
  daysContainer: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "space-between",
  },
  dayButton: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dayButtonActive: {
    backgroundColor: "#6C5CE7",
    borderColor: "#6C5CE7",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  dayButtonTextActive: {
    color: "#fff",
  },

  // 종료 조건 설정
  endConditionContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  endConditionButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  endConditionButtonActive: {
    backgroundColor: "#6C5CE7",
    borderColor: "#6C5CE7",
  },
  endConditionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  endConditionButtonTextActive: {
    color: "#fff",
  },

  // 날짜 입력
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  dateInputLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },

  // 횟수 입력
  countInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  countInputLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  countTextInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    textAlign: "center",
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // 예외일 설정
  exceptionContainer: {
    marginTop: 12,
  },
  exceptionLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 8,
  },
  exceptionDatesContainer: {
    marginBottom: 12,
  },
  exceptionDateItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  exceptionDateText: {
    fontSize: 16,
    color: "#333",
  },
  removeDateButton: {
    padding: 4,
  },
  addExceptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addExceptionButtonText: {
    fontSize: 16,
    color: "#6C5CE7",
    fontWeight: "500",
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
});

