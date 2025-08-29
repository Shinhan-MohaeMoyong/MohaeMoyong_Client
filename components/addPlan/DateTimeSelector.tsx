// components/addPlan/DateTimeSelector.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";

type Props = {
  selectedDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  onDateSelect: (iso: string) => void;
  onStartTimeChange: (hhmm: string) => void;
  onEndTimeChange: (hhmm: string) => void;
};

const STEP_MIN = 15;
const MIN_RANGE = 15;

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

// ✅ 유틸: ISO -> Date(자정), 일수 차이, 포맷
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const diffInDays = (a: Date, b: Date) => {
  const A = startOfDay(a).getTime();
  const B = startOfDay(b).getTime();
  return Math.round((A - B) / (1000 * 60 * 60 * 24));
};
const WEEKDAY_KR = ["일", "월", "화", "수", "목", "금", "토"];
const formatKoreanDate = (d: Date) =>
  `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY_KR[d.getDay()]})`;
const relativeLabelFromToday = (selected: Date, today: Date) => {
  const delta = diffInDays(selected, today); // +면 미래, -면 과거
  if (delta === 0) return "오늘";
  if (delta === 1) return "내일";
  if (delta === 2) return "모레";
  if (delta === -1) return "어제";
  if (delta === -2) return "그저께";
  return delta > 0 ? `오늘에서 ${delta}일 뒤` : `오늘에서 ${Math.abs(delta)}일 전`;
};

const ITEM_TOTAL_WIDTH = 84; // dateItem width(76) + 좌우 margin(4+4)

export default function DateTimeSelector({
  selectedDate,
  startTime,
  endTime,
  onDateSelect,
  onStartTimeChange,
  onEndTimeChange,
}: Props) {
  // 오늘/선택 날짜
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

  // 날짜 스트립(오늘부터 기본 시작, 너무 먼 미래 선택 시 선택일 중심으로 당김)
  const selectedDateObj = useMemo(() => parseISO(normalizedDateISO), [normalizedDateISO]);
  const selectedAbsLabel = useMemo(() => formatKoreanDate(selectedDateObj), [selectedDateObj]);
  const selectedRelLabel = useMemo(
    () => relativeLabelFromToday(selectedDateObj, today),
    [selectedDateObj, today]
  );

  const dateStrip = useMemo(() => {
    const arr: { iso: string; labelTop: string; labelBottom: string; isToday: boolean }[] = [];

    const todayStart = startOfDay(today);
    const deltaFromToday = diffInDays(selectedDateObj, todayStart); // +면 미래, -면 과거

    // 기본 시작: 오늘부터
    let start = new Date(todayStart);

    // 선택일이 오늘로부터 20일을 훌쩍 넘는 먼 미래라면
    // 선택일이 리스트 중간쯤에 오도록 선택일-10일부터 시작
    if (deltaFromToday > 20) {
      const anchor = startOfDay(selectedDateObj);
      start = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - 10);
    }

    for (let i = 0; i < 21; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const iso = toISO(d);
      const weekday = WEEKDAY_KR[d.getDay()];
      arr.push({
        iso,
        labelTop: weekday,
        labelBottom: `${d.getMonth() + 1}/${d.getDate()}`,
        isToday: iso === isoToday,
      });
    }
    return arr;
  }, [today, selectedDateObj, isoToday]);

  // FlatList 중앙 스크롤 세팅
  const listRef = useRef<FlatList<any> | null>(null);
  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_TOTAL_WIDTH,
    offset: ITEM_TOTAL_WIDTH * index,
    index,
  });
  const scrollDateToCenter = (iso: string) => {
    const idx = dateStrip.findIndex((d) => d.iso === iso);
    if (idx < 0) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: idx,
        animated: true,
        viewPosition: 0.5, // 가운데
      });
    });
  };

  // 시간 상태(분)
  const [startMin, setStartMin] = useState<number>(() => snap(parseHHmmToMin(startTime)));
  const [endMin, setEndMin] = useState<number>(() => snap(parseHHmmToMin(endTime)));
  useEffect(() => setStartMin(snap(parseHHmmToMin(startTime))), [startTime]);
  useEffect(() => setEndMin(snap(parseHHmmToMin(endTime))), [endTime]);

  // 편집 모드
  const [editing, setEditing] = useState<null | "start" | "end">(null);
  const [tempMin, setTempMin] = useState<number>(0);

  const ensureOrder = (s: number, e: number) => {
    if (e - s < MIN_RANGE) {
      if (s + MIN_RANGE <= 24 * 60) return [s, s + MIN_RANGE] as const;
      return [e - MIN_RANGE, e] as const;
    }
    return [s, e] as const;
  };

  const beginEdit = (type: "start" | "end") => {
    setEditing(type);
    setTempMin(type === "start" ? startMin : endMin);
  };

  const tempDate = useMemo(() => {
    const d = new Date();
    d.setHours(Math.floor(tempMin / 60), tempMin % 60, 0, 0);
    return d;
  }, [tempMin]);

  const onPickerChange = (_: any, d?: Date) => {
    if (!d) return;
    setTempMin(snap(d.getHours() * 60 + d.getMinutes()));
  };

  const confirmEdit = () => {
    if (!editing) return;
    if (editing === "start") {
      const [s] = ensureOrder(tempMin, endMin);
      setStartMin(s);
      onStartTimeChange(minToHHmm(s));
    } else {
      const [, e] = ensureOrder(startMin, tempMin);
      setEndMin(e);
      onEndTimeChange(minToHHmm(e));
    }
    setEditing(null);
  };
  const cancelEdit = () => setEditing(null);

  // 소요시간
  const duration = Math.max(0, endMin - startMin);
  const durationLabel =
    duration >= 60
      ? `${Math.floor(duration / 60)}시간${duration % 60 ? ` ${duration % 60}분` : ""}`
      : `${duration}분`;

  const [calendarOpen, setCalendarOpen] = useState(false);

  // ✅ 선택 날짜가 바뀔 때마다 중앙 정렬(달력/스트립 모두 대응)
  useEffect(() => {
    scrollDateToCenter(normalizedDateISO);
  }, [normalizedDateISO, dateStrip.length]);

  // ✅ 초기 로드 시에도 오늘을 중앙에 두고 시작하려면 아래 주석 해제
  // useEffect(() => {
  //   scrollDateToCenter(isoToday);
  // }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>*날짜</Text>

      {/* ✅ 선택일 정보 바: 절대일 + 상대일 + 오늘로 이동 */}
      <View style={styles.selectedInfoBar}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="calendar-outline" size={16} color="#574BD6" />
          <Text style={styles.selectedAbs}>{selectedAbsLabel}</Text>
          <Text style={styles.selectedRel}>· {selectedRelLabel}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onDateSelect(isoToday)}
          style={styles.todayBtn}
          accessibilityLabel="오늘로 이동"
        >
          <Ionicons name="navigate-outline" size={14} color="#6C5CE7" />
          <Text style={styles.todayBtnText}>오늘</Text>
        </TouchableOpacity>
      </View>

      {/* 날짜 스트립 */}
      <FlatList
        ref={listRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={dateStrip}
        keyExtractor={(item) => item.iso}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        getItemLayout={getItemLayout}
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

      {/* 달력 */}
      {calendarOpen && (
        <View style={styles.calendarBox}>
          <Calendar
            onDayPress={(d) => {
              onDateSelect(d.dateString);
              scrollDateToCenter(d.dateString); // ⬅️ 달력에서 날짜 선택 시 중앙 배치
            }}
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
      <Text style={[styles.label, { marginTop: 20 }]}>*시간</Text>

      {/* ⬇️ 시작/종료 한 행, 동일 너비, 가운데 정렬 */}
      <View style={styles.timeRowOneLine}>
        <TouchableOpacity
          onPress={() => beginEdit("start")}
          style={[styles.timeBadgeLarge, { marginRight: 8 }]}
        >
          <Ionicons name="play-outline" size={20} color="#574BD6" />
          <Text style={styles.timeBadgeTextLarge}>{minToHHmm(startMin)}</Text>
          <Ionicons name="pencil" size={18} color="#8E88F6" />
        </TouchableOpacity>

        <Text style={styles.arrowLarge}>→</Text>

        <TouchableOpacity
          onPress={() => beginEdit("end")}
          style={[styles.timeBadgeLarge, { marginLeft: 8 }]}
        >
          <Ionicons name="stop-outline" size={20} color="#574BD6" />
          <Text style={styles.timeBadgeTextLarge}>{minToHHmm(endMin)}</Text>
          <Ionicons name="pencil" size={18} color="#8E88F6" />
        </TouchableOpacity>
      </View>

      {/* 편집 패널: 같은 폭으로 중앙 */}
      {editing && (
        <View style={styles.editPanelCentered}>
          <Text style={styles.editTitle}>
            {editing === "start" ? "시작 시간 설정" : "종료 시간 설정"}
          </Text>
          <DateTimePicker
            value={(() => {
              const d = new Date();
              d.setHours(Math.floor(tempMin / 60), tempMin % 60, 0, 0);
              return d;
            })()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "spinner"}
            is24Hour
            onChange={onPickerChange}
          />
          <View style={styles.editButtons}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={cancelEdit}>
              <Text style={[styles.btnText, { color: "#6C5CE7" }]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={confirmEdit}>
              <Text style={[styles.btnText, { color: "#fff" }]}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 소요시간: 위 한 행과 같은 폭으로 정렬 */}
      <View style={styles.durationBarWide}>
        <Ionicons name="time-outline" size={18} />
        <Text style={styles.durationText}>총 소요 {durationLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 12 },

  selectedInfoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E7E5FF",
    backgroundColor: "#F5F4FF",
    marginBottom: 8,
  },
  selectedAbs: { fontSize: 14, fontWeight: "800", color: "#2a255e" },
  selectedRel: { fontSize: 12, fontWeight: "700", color: "#6C5CE7" },
  todayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EEF1FF",
    borderWidth: 1,
    borderColor: "#DDE2FF",
  },
  todayBtnText: { color: "#6C5CE7", fontWeight: "800", fontSize: 12 },

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
  dateItemActive: { backgroundColor: "#6C5CE7", borderColor: "#6C5CE7" },
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

  // === 시간 한 줄 & 동일 폭 컨테이너 ===
  timeRowOneLine: {
    marginTop: 4,
    marginBottom: 8,
    marginHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timeBadgeLarge: {
    flex: 1, // ⬅️ 두 배지 동일 폭
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#F1F0FF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E5FF",
  },
  timeBadgeTextLarge: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2a255e",
  },
  arrowLarge: { fontSize: 18, color: "#888" },

  // 편집 패널: 상단 행과 동일 폭
  editPanelCentered: {
    marginTop: 12,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6E6F0",
    backgroundColor: "#F8F8FA",
  },
  editTitle: { fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 6 },
  editButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnGhost: { backgroundColor: "#EEF1FF", borderWidth: 1, borderColor: "#DDE2FF" },
  btnPrimary: { backgroundColor: "#6C5CE7" },
  btnText: { fontWeight: "800" },

  // 소요시간: 동일 폭
  durationBarWide: {
    marginTop: 12,
    marginHorizontal: 4,
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
