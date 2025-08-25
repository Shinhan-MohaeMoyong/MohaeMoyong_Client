// src/components/schedule/WeekGrid.tsx
import type { PlanEntity, PlanGridDTO } from "@/types";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import EventBlock from "./EventBlock";


const DAY_LABEL = ["월", "화", "수", "목", "금", "토", "일"];
const PULL_THRESHOLD = 64;
const GUTTER = 26;
const COL_GAP = 8;

type Props = {
  plans: PlanEntity[];
  startDay?: Date;               // 시작 날짜
  endDay?: Date;                 // 끝 날짜
  startHour?: number;
  endHour?: number;
  hourHeight?: number;
  visibleDays?: number;           // 기본 5일만 화면에 보이게
  onChangeWeek?: (delta: -1 | 1) => void;
  onPressPlan?: (p: PlanEntity) => void;
};

export default function WeekGrid({
  plans,
  startDay,
  endDay,
  startHour = 9,
  endHour = 21,          // ← 21시(밤 9시)까지
  hourHeight = 64,
  visibleDays = 5,
  onChangeWeek,
  onPressPlan,
}: Props) {
  const [layoutW, setLayoutW] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [contentW, setContentW] = useState(0);

  const headerRef = useRef<ScrollView>(null); // 👈 헤더용
  const horizRef = useRef<ScrollView>(null);  // 본문 가로 스크롤
  const pullProgress = useRef(new Animated.Value(0)).current;
  const pullSide = useRef<"left" | "right" | null>(null);


  const hours = useMemo(() => {
    const arr: number[] = [];
    for (let h = startHour; h <= endHour; h++) arr.push(h);
    return arr;
  }, [startHour, endHour]);

  const contentHeight = (endHour - startHour) * hourHeight;

  const onOuterLayout = (e: LayoutChangeEvent) => {
    setLayoutW(e.nativeEvent.layout.width);
  };

  const visibleColsW = Math.max(0, layoutW - GUTTER);
  const colWidth =
    visibleDays > 0 ? (visibleColsW - COL_GAP * (visibleDays - 1)) / visibleDays : 0;
  const totalColsW = colWidth * 7 + COL_GAP * 6;
  if (totalColsW !== contentW && totalColsW > 0) setContentW(totalColsW);
  
  const atLeftEdge = scrollX <= 1;
  const atRightEdge = contentW > 0 && scrollX >= contentW - visibleColsW - 1;

  const onScrollX = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setScrollX(x);
    headerRef.current?.scrollTo({ x, animated: false });
  };

  const triggerWeekChange = (dir: -1 | 1) => {
    onChangeWeek?.(dir);
    requestAnimationFrame(() => {
      horizRef.current?.scrollTo({ x: 0, animated: false });
      headerRef.current?.scrollTo({ x: 0, animated: false }); // 👈 추가
    });
  };


  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => {
          const horiz = Math.abs(g.dx) > Math.abs(g.dy);
          if (!horiz) return false;
          if (atLeftEdge && g.dx > 0) {
            pullSide.current = "left";
            return true;
          }
          if (atRightEdge && g.dx < 0) {
            pullSide.current = "right";
            return true;
          }
          return false;
        },
        onPanResponderMove: (_, g) => {
          const prog =
            pullSide.current === "left"
              ? Math.min(1, Math.max(0, g.dx / PULL_THRESHOLD))
              : pullSide.current === "right"
              ? Math.min(1, Math.max(0, -g.dx / PULL_THRESHOLD))
              : 0;
          pullProgress.setValue(prog);
        },
        onPanResponderRelease: () => {
          const should = (pullProgress as any)._value >= 1;
          const side = pullSide.current;
          Animated.timing(pullProgress, { toValue: 0, duration: 150, useNativeDriver: true }).start();
          pullSide.current = null;
          if (should) triggerWeekChange(side === "left" ? -1 : 1);
        },
        onPanResponderTerminate: () => {
        // 제스처 중단 시에도 리셋
        Animated.timing(pullProgress, { toValue: 0, duration: 150, useNativeDriver: true }).start();
        pullSide.current = null;
        },
      }),
    [atLeftEdge, atRightEdge, onChangeWeek, pullProgress]
  );

  

  const indicatorOpacity = pullProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const indicatorScale = pullProgress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] });

  const rects: PlanGridDTO[] = useMemo(() => {
    // 날짜 범위 필터링
    const filteredPlans = plans.filter((p) => {
      if (!startDay || !endDay) return true; // 날짜 범위가 없으면 모든 일정 표시
      
      const planDate = new Date(p.startTime);
      const planStartOfDay = new Date(planDate.getFullYear(), planDate.getMonth(), planDate.getDate());
      
      return planStartOfDay >= startDay && planStartOfDay <= endDay;
    });

    return filteredPlans.map((p) => {
      const start = new Date(p.startTime);
      const jsDay = start.getDay();          // 0=일
      const dayIdx = (jsDay + 6) % 7;        // 0=월 ... 6=일
      const end = new Date(p.endTime ?? p.startTime);
      const minutesFromStart = (start.getHours() - startHour) * 60 + start.getMinutes();
      const durationMin = Math.max(30, Math.floor((end.getTime() - start.getTime()) / 60000) || 60);
      const top = (minutesFromStart / 60) * hourHeight;
      const height = (durationMin / 60) * hourHeight;
      const left = dayIdx * (colWidth + COL_GAP);
      const width = colWidth+COL_GAP;
      
      // isNew 속성 추가 (PlanEntity의 new 필드 사용)
      const isNew = p.new || false;
      
      return { plan: p, rect: { top, left, width, height }, isNew };
    });
  }, [plans, startDay, endDay, colWidth, hourHeight, startHour]);

  return (
    <View style={styles.root} onLayout={onOuterLayout} {...panResponder.panHandlers}>
      {/* 상단 요일 헤더 (고정) */}
      <View style={{ marginLeft: GUTTER }}>
        <ScrollView
          ref={headerRef}
          horizontal
          scrollEnabled={false}              // 직접 스크롤 막고
          showsHorizontalScrollIndicator={false}
          style={{ width: visibleColsW, overflow: "hidden" }}
          contentContainerStyle={{ width: totalColsW }}
          bounces={false}
        >
          <View style={styles.headerRow}>
            {DAY_LABEL.map((label, idx) => (
              <View
                key={label}
                style={[
                  styles.headerCell,
                  { width: colWidth+COL_GAP//, marginRight: idx === 6 ? 0 : COL_GAP,
                    
                   },
                ]}
              >
                <Text style={styles.headerText}>{label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ↓↓↓ 여기서부터 "세로 스크롤" 뷰포트 ↓↓↓ */}
      <ScrollView
        style={styles.vertViewport}
        contentContainerStyle={{ height: contentHeight }}
        showsVerticalScrollIndicator
        nestedScrollEnabled
        scrollEventThrottle={16}
        bounces={false}
      >
        <View style={styles.bodyRow}>
          <View style={{width: 5}}/>
          <View style={[styles.gutter, { width: GUTTER-5 }]}>
            {hours.slice(0, -1).map((h) => (
              <View key={h} style={[styles.gutterHour, { height: hourHeight }]}>
                <Text style={styles.gutterText}>{`${String(h).padStart(2, "0")}`}</Text>
              </View>
            ))}
          </View>

          <ScrollView
            ref={horizRef}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScrollX}                // 👈 헤더와 동기화
            scrollEventThrottle={16}
            style={{ width: visibleColsW }}
            contentContainerStyle={{ width: totalColsW, height: "100%" }}
            bounces={false}
          >
            {/* 가로 라인들 (세로 스크롤과 함께 움직임) */}
            {hours.map((h, i) => (
              <View
                key={`line-${h}-${i}`}
                style={[
                  styles.hLine,
                  { top: (h - startHour) * hourHeight, width: totalColsW },
                  i === 0 ? { opacity: 1 } : null,
                ]}
              />
            ))}

            {/* 세로 컬럼 빈 셀 */}
            <View style={[styles.colRow, { width: totalColsW }]}>
              {DAY_LABEL.map((_, idx) => (
                
                <View
                  key={idx}
                  style={[styles.colCell, {  width: colWidth, marginRight: idx === 6 ? 0 : COL_GAP,
                    
                    }]}
                />
              ))}
            </View>

            {/* 이벤트 블록들 */}
            {rects.map(({ plan, rect, isNew }) => (
              <EventBlock key={plan.planId} plan={plan} rect={rect} isNew={isNew} onPress={() => onPressPlan?.(plan)} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* 당김 인디케이터 */}
      {atLeftEdge && (
        <Animated.View
          pointerEvents="none"
          style={[styles.pullIndicator, { left: 8, opacity: indicatorOpacity, transform: [{ scale: indicatorScale }] }]}
        >
          <Text style={styles.pullArrow}>←</Text>
          <Text style={styles.pullText}>이전 주로 이동</Text>
        </Animated.View>
      )}
      {atRightEdge && (
        <Animated.View
          pointerEvents="none"
          style={[styles.pullIndicator, { right: 8, opacity: indicatorOpacity, transform: [{ scale: indicatorScale }] }]}
        >
          <Text style={styles.pullText}>다음 주로 이동</Text>
          <Text style={styles.pullArrow}>→</Text>
        </Animated.View>
      )}
    </View>
  );
}

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

const styles = StyleSheet.create({
  root: { flex: 1, marginLeft: "-1%"},
  headerRow: { flexDirection: "row", marginBottom: 0 },
  headerCell: { alignItems: "center" , borderLeftWidth: 1, borderColor: "#E5E7EB", borderBottomWidth: 0.2, paddingBottom: 3},
  headerText: { fontSize: 10, color: "#686464" },
  vertViewport: { flex: 1 },              // ← 세로 스크롤 뷰포트
  bodyRow: { flexDirection: "row", height: "100%" },
  gutter: { paddingTop: 0 },
  gutterHour: { alignItems: "flex-end", justifyContent: "flex-start", paddingRight: 4, borderTopWidth: 1, borderColor: "#E5E7EBCC"},
  gutterText: { fontSize: 10, color: "#686464" },
  hLine: { position: "absolute", height: StyleSheet.hairlineWidth, backgroundColor: "#E5E7EB", opacity: 0.8 },
  colRow: { height: "100%", flexDirection: "row" },
  colCell: { height: "100%", borderLeftWidth: 1, borderColor: "#E5E7EB" },
  pullIndicator: {
    position: "absolute",
    top: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(17,17,17,0.75)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pullArrow: { fontSize: 14, color: "#fff", fontWeight: "900" },
  pullText: { fontSize: 12, color: "#fff", fontWeight: "700" },
});
