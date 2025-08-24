import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type MarkedDates = Record<string, number | undefined>;

type Props = {
  monthDate: Date;
  selectedDate: Date;
  onChangeMonth?: (next: Date) => void;
  onSelectDate?: (d: Date) => void;
  markedDates?: MarkedDates; // key: YYYY-MM-DD -> count
};

export default function MonthlyCalendar({
  monthDate,
  selectedDate,
  onChangeMonth,
  onSelectDate,
  markedDates = {},
}: Props) {
  const { firstCellDate, days } = useMemo(() => buildMonthGrid(monthDate), [monthDate]);
  const headerLabel = useMemo(() => `${monthDate.getFullYear()}년 ${monthDate.getMonth() + 1}월`, [monthDate]);
  const selectedKey = useMemo(() => toKey(selectedDate), [selectedDate]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => onChangeMonth?.(addMonths(monthDate, -1))} style={styles.navBtn}>
          <Text style={styles.navText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{headerLabel}</Text>
        <Pressable onPress={() => onChangeMonth?.(addMonths(monthDate, 1))} style={styles.navBtn}>
          <Text style={styles.navText}>{">"}</Text>
        </Pressable>
      </View>

      <View style={styles.dowRow}>
        {DOW.map((d) => (
          <Text key={d} style={styles.dowText}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((_, idx) => {
          const d = new Date(firstCellDate);
          d.setDate(firstCellDate.getDate() + idx);
          const inMonth = d.getMonth() === monthDate.getMonth();
          const key = toKey(d);
          const markCount = markedDates[key] ?? 0;
          const hasEvent = markCount > 0;
          const isSelected = key === selectedKey;
          return (
            <Pressable key={idx} onPress={() => onSelectDate?.(d)} style={styles.cell}>
              <View style={[
                styles.dayWrap,
                hasEvent ? styles.dayWrapEvent : styles.dayWrapNoEvent,
                isSelected && styles.dayWrapSelected,
                !inMonth && styles.dayWrapOut,
              ]}>
                <Text style={[
                  styles.dayText,
                  hasEvent ? styles.dayTextEvent : styles.dayTextNoEvent,
                  isSelected && styles.dayTextSelected,
                  !inMonth && styles.dayTextOut,
                ]}>
                  {d.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

function buildMonthGrid(ref: Date) {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  const firstOfMonth = new Date(y, m, 1);
  const startOffset = firstOfMonth.getDay();
  const firstCellDate = new Date(y, m, 1 - startOffset);
  const days = new Array(42).fill(0);
  return { firstCellDate, days };
}

function addMonths(d: Date, n: number) {
  const next = new Date(d.getFullYear(), d.getMonth() + n, 1);
  next.setDate(Math.min(d.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
  return next;
}

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  navBtn: { width: 40, height: 32, alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 16, color: "#7C5CFA", fontWeight: "800" },
  dowRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 6, marginBottom: 6 },
  dowText: { width: `${100 / 7}%`, textAlign: "center", color: "#9AA0A6", fontSize: 11 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, alignItems: "center", marginVertical: 6 },
  dayWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  dayWrapEvent: { backgroundColor: "#E3E5E8" },
  dayWrapNoEvent: { backgroundColor: "transparent" },
  dayWrapSelected: { backgroundColor: "#8C93FF" },
  dayWrapOut: { opacity: 0.5 },
  dayText: { fontSize: 12 },
  dayTextEvent: { color: "#111", fontWeight: "800" },
  dayTextNoEvent: { color: "#B0B5BB", fontWeight: "700" },
  dayTextSelected: { color: "#111", fontWeight: "800" },
  dayTextOut: { opacity: 0.7 },
});

