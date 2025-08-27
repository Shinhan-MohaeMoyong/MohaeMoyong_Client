// components/addPlan/DateTimeSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

type Props = {
  selectedDate: string; // "YYYY-MM-DD" 권장(일자만 와도 동작)
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  onDateSelect: (iso: string) => void;
  onStartTimeChange: (hhmm: string) => void;
  onEndTimeChange: (hhmm: string) => void;
};

const STEP_MIN = 15; // 15분 스냅
const MIN_RANGE = 15; // 최소 15분 간격

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseHHmmToMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const minToHHmm = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad(h)}:${pad(m)}`;
};
const snap = (mins: number, step = STEP_MIN) => Math.round(mins / step) * step;

export default function DateTimeSelector({
  selectedDate,
  startTime,
  endTime,
  onDateSelect,
  onStartTimeChange,
  onEndTimeChange,
}: Props) {
  // --- 날짜 ISO 정규화 ---
  const today = useMemo(() => new Date(), []);
  const isoToday = useMemo(() => toISO(today), [today]);
  const normalizedDateISO = useMemo(() => {
    if (!selectedDate) return isoToday;
    if (/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) return selectedDate;
    const n = parseInt(selectedDate, 10);
    if (!isNaN(n) && n >= 1 && n <= 31) {
      const d = new Date();
      d.setDate(n);
      return toISO(d);
    }
    return isoToday;
  }, [selectedDate, isoToday]);

  // --- 날짜 스트립 데이터(21일) ---
  const dateStrip = useMemo(() => {
    const arr: { iso: string; labelTop: string; labelBottom: string; isToday: boolean }[] = [];
    for (let i = 0; i < 21; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const iso = toISO(d);
      const weekday = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
      arr.push({
        iso,
        labelTop: weekday,
        labelBottom: `${d.getMonth() + 1}/${d.getDate()}`,
        isToday: iso === isoToday,
      });
    }
    return arr;
  }, [today, isoToday]);

  // --- 트랙 상태 ---
  const [trackWidth, setTrackWidth] = useState(0);
  const trackLeftPadding = 16;
  const trackRightPadding = 16;

  // 시작/종료 시간 -> 분
  const [startMin, setStartMin] = useState<number>(() => snap(parseHHmmToMin(startTime)));
  const [endMin, setEndMin] = useState<number>(() => snap(parseHHmmToMin(endTime)));

  // 네이티브 피커(원하는 분만 유지)
  const [pickerType, setPickerType] = useState<null | "start" | "end">(null);
  const [pickerValue, setPickerValue] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // 외부 값 변경 시 동기화
  useEffect(() => setStartMin(snap(parseHHmmToMin(startTime))), [startTime]);
  useEffect(() => setEndMin(snap(parseHHmmToMin(endTime))), [endTime]);

  // 드래그용 PanResponder
  const startRef = useRef({ x: 0 });
  const endRef = useRef({ x: 0 });

  const totalMins = 24 * 60;
  const usableWidth = Math.max(0, trackWidth - trackLeftPadding - trackRightPadding);
  const minToX = (mins: number) => trackLeftPadding + (mins / totalMins) * usableWidth;
  const xToMin = (x: number) => {
    const clamped = Math.min(trackWidth - trackRightPadding, Math.max(trackLeftPadding, x));
    const ratio = (clamped - trackLeftPadding) / (usableWidth || 1);
    return snap(Math.round(ratio * totalMins));
  };

  const ensureOrder = (s: number, e: number) => {
    // 최소 간격 보장
    if (e - s < MIN_RANGE) {
      if (s + MIN_RANGE <= totalMins) return [s, s + MIN_RANGE] as const;
      return [e - MIN_RANGE, e] as const;
    }
    return [s, e] as const;
  };

  const startPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gesture) => {
          startRef.current.x = minToX(startMin);
        },
        onPanResponderMove: (_, gesture) => {
          const nextMin = xToMin(startRef.current.x + gesture.dx);
          const [s, e] = ensureOrder(nextMin, endMin);
          setStartMin(s);
          onStartTimeChange(minToHHmm(s));
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startMin, endMin, trackWidth]
  );

  const endPan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          endRef.current.x = minToX(endMin);
        },
        onPanResponderMove: (_, gesture) => {
          const nextMin = xToMin(endRef.current.x + gesture.dx);
          const [s, e] = ensureOrder(startMin, nextMin);
          setEndMin(e);
          onEndTimeChange(minToHHmm(e));
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startMin, endMin, trackWidth]
  );

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const duration = Math.max(0, endMin - startMin);
  const durationLabel =
    duration >= 60
      ? `${Math.floor(duration / 60)}시간${duration % 60 ? ` ${duration % 60}분` : ""}`
      : `${duration}분`;

  // 텍스트 탭 → 네이티브 시간 피커
  const openNativePicker = (type: "start" | "end") => {
    setPickerType(type);
    const base = new Date();
    const mins = type === "start" ? startMin : endMin;
    base.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
    setPickerValue(base);
  };
  const onNativeTimeChange = (_: any, d?: Date) => {
    if (!d) {
      if (Platform.OS === "android") setPickerType(null);
      return;
    }
    const mins = d.getHours() * 60 + d.getMinutes();
    if (pickerType === "start") {
      const [s, e] = ensureOrder(snap(mins), endMin);
      setStartMin(s);
      onStartTimeChange(minToHHmm(s));
      if (Platform.OS === "android") setPickerType(null);
    } else if (pickerType === "end") {
      const [s, e] = ensureOrder(startMin, snap(mins));
      setEndMin(e);
      onEndTimeChange(minToHHmm(e));
      if (Platform.OS === "android") setPickerType(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>날짜</Text>

      {/* 날짜 스트립 */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={dateStrip}
        keyExtractor={(item) => item.iso}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        renderItem={({ item }) => {
          const active = item.iso === normalizedDateISO;
          return (
            <TouchableOpacity
              onPress={() => onDateSelect(item.iso)}
              style={[styles.dateItem, active && styles.dateItemActive]}
            >
              <Text style={[styles.dateTop, active && styles.dateTopActive]}>
                {item.labelTop}
                {item.isToday ? " (오늘)" : ""}
              </Text>
              <Text style={[styles.dateBottom, active && styles.dateBottomActive]}>
                {item.labelBottom}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* 달력 버튼 */}
      <View style={{ alignItems: "flex-end", marginTop: 8 }}>
        <TouchableOpacity style={styles.calendarBtn} onPress={() => setCalendarOpen((v) => !v)}>
          <Ionicons name="calendar-outline" size={18} color="#6C5CE7" />
          <Text style={styles.calendarBtnText}>{calendarOpen ? "달력 닫기" : "달력 열기"}</Text>
        </TouchableOpacity>
      </View>

      {/* 월달력 (옵션) */}
      {calendarOpen && (
        <View style={styles.calendarBox}>
          <Calendar
            onDayPress={(d) => onDateSelect(d.dateString)}
            markedDates={{
              [normalizedDateISO]: { selected: true, selectedColor: "#6C5CE7" },
              [isoToday]: { marked: true, dotColor: "#6C5CE7" },
            }}
            theme={{
              selectedDayBackgroundColor: "#6C5CE7",
              selectedDayTextColor: "#fff",
              todayTextColor: "#6C5CE7",
              arrowColor: "#6C5CE7",
              monthTextColor: "#6C5CE7",
            }}
          />
        </View>
      )}

      {/* 시간 */}
      <Text style={[styles.label, { marginTop: 20 }]}>시간</Text>

      {/* 현재 값 + 네이티브 피커로 수정 링크 */}
      <View style={styles.timeRow}>
        <TouchableOpacity onPress={() => openNativePicker("start")} style={styles.timeBadge}>
          <Ionicons name="play-outline" size={16} color="#574BD6" />
          <Text style={styles.timeBadgeText}>{minToHHmm(startMin)}</Text>
          <Ionicons name="pencil" size={14} color="#A39CF0" />
        </TouchableOpacity>
        <Text style={styles.arrow}>→</Text>
        <TouchableOpacity onPress={() => openNativePicker("end")} style={styles.timeBadge}>
          <Ionicons name="stop-outline" size={16} color="#574BD6" />
          <Text style={styles.timeBadgeText}>{minToHHmm(endMin)}</Text>
          <Ionicons name="pencil" size={14} color="#A39CF0" />
        </TouchableOpacity>
      </View>

      {/* 타임라인 트랙 */}
      <View style={styles.trackWrap} onLayout={onTrackLayout}>
        {/* 축 라벨 */}
        <View style={styles.axis}>
          {[0, 6, 12, 18, 24].map((h) => (
            <View key={h} style={styles.axisTick}>
              <View style={styles.tickDot} />
              <Text style={styles.tickText}>{pad(h)}:00</Text>
            </View>
          ))}
        </View>

        {/* 트랙 */}
        <View style={styles.track}>
          <View style={styles.trackBg} />
          {/* 선택 영역 */}
          <View
            style={[
              styles.selection,
              {
                left: minToX(startMin),
                width: Math.max(0, minToX(endMin) - minToX(startMin)),
              },
            ]}
          />
          {/* Start 핸들 */}
          <View {...startPan.panHandlers} style={[styles.handle, { left: minToX(startMin) - 12 }]}>
            <View style={styles.handleCore} />
          </View>
          {/* End 핸들 */}
          <View {...endPan.panHandlers} style={[styles.handle, { left: minToX(endMin) - 12 }]}>
            <View style={styles.handleCore} />
          </View>
        </View>
      </View>

      {/* 소요시간 */}
      <View style={styles.durationBar}>
        <Ionicons name="time-outline" size={18} color="#6C5CE7" />
        <Text style={styles.durationText}>총 소요 {durationLabel}</Text>
      </View>

      {/* 네이티브 시간 피커(iOS는 인라인 스피너, 안드로이드 모달) */}
      {pickerType && (
        <DateTimePicker
          value={pickerValue}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          is24Hour
          onChange={onNativeTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 12 },

  // 날짜 스트립
  dateItem: {
    width: 76,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9e9f2",
    backgroundColor: "#f7f7fb",
    alignItems: "center",
  },
  dateItemActive: {
    backgroundColor: "#6C5CE7",
    borderColor: "#6C5CE7",
  },
  dateTop: { fontSize: 12, color: "#666", marginBottom: 6, fontWeight: "600" },
  dateTopActive: { color: "#fff" },
  dateBottom: { fontSize: 14, color: "#333", fontWeight: "700" },
  dateBottomActive: { color: "#fff" },

  calendarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#EEF1FF",
    borderWidth: 1,
    borderColor: "#DDE2FF",
  },
  calendarBtnText: { color: "#6C5CE7", fontWeight: "700", fontSize: 12 },

  calendarBox: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    borderColor: "#eee",
    borderWidth: 1,
  },

  // 시간 표시
  timeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F0FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6E5FF",
  },
  timeBadgeText: { fontSize: 16, fontWeight: "800", color: "#2a255e" },
  arrow: { fontSize: 16, color: "#888" },

  // 트랙
  trackWrap: { marginTop: 12 },
  axis: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  axisTick: { alignItems: "center" },
  tickDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C6C3FF",
    marginBottom: 4,
  },
  tickText: { fontSize: 11, color: "#666" },

  track: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6F0",
    backgroundColor: "#F8F8FA",
    justifyContent: "center",
  },
  trackBg: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E9E9F3",
  },
  selection: {
    position: "absolute",
    top: 19,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6C5CE7",
  },
  handle: {
    position: "absolute",
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#6C5CE7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  handleCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C5CE7",
  },

  // 기간
  durationBar: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5F4FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E7E5FF",
  },
  durationText: { fontSize: 13, fontWeight: "700", color: "#574BD6" },
});
