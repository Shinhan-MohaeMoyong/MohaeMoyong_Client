import { useMemo, useRef, useState } from 'react';
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
} from 'react-native';
import type { PlanEntity } from '../../types';
import EventBlock from './EventBlock';

const DAY_LABEL = ["월", "화", "수", "목", "금", "토", "일"];
const PULL_THRESHOLD = 64;
const GUTTER = 26;
const COL_GAP = 8;

interface WeekGridProps {
  plans: PlanEntity[];
  startDay?: Date;
  endDay?: Date;
  startHour?: number;
  endHour?: number;
  hourHeight?: number;
  visibleDays?: number;
  onChangeWeek?: (delta: -1 | 1) => void;
  onPressPlan?: (p: PlanEntity) => void;
}

export default function WeekGrid({
  plans,
  startDay,
  endDay,
  startHour = 9,
  endHour = 21,
  hourHeight = 64,
  visibleDays = 5,
  onChangeWeek,
  onPressPlan,
}: WeekGridProps) {
  const [layoutW, setLayoutW] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [contentW, setContentW] = useState(0);

  const headerRef = useRef<ScrollView>(null);
  const horizRef = useRef<ScrollView>(null);
  const pullProgress = useRef(new Animated.Value(0)).current;
  const pullSide = useRef<"left" | "right" | null>(null);
  const isWeekChanging = useRef(false);

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
    isWeekChanging.current = true;
    onChangeWeek?.(dir);
    requestAnimationFrame(() => {
      const centerX = colWidth + COL_GAP;
      horizRef.current?.scrollTo({ x: centerX, animated: false });
      headerRef.current?.scrollTo({ x: centerX, animated: false });
      setTimeout(() => {
        isWeekChanging.current = false;
      }, 1000);
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onPanResponderGrant: () => {
          pullProgress.setValue(0);
          pullSide.current = null;
        },
        onPanResponderMove: (_, gestureState) => {
          if (isWeekChanging.current) return;

          const { dx } = gestureState;
          
          if (atLeftEdge && dx > PULL_THRESHOLD) {
            pullSide.current = "left";
            pullProgress.setValue(Math.min(dx - PULL_THRESHOLD, 100));
          } else if (atRightEdge && dx < -PULL_THRESHOLD) {
            pullSide.current = "right";
            pullProgress.setValue(Math.min(-dx - PULL_THRESHOLD, 100));
          } else {
            pullProgress.setValue(0);
            pullSide.current = null;
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (isWeekChanging.current) return;

          const { dx } = gestureState;
          
          if (pullSide.current === "left" && dx > PULL_THRESHOLD + 50) {
            triggerWeekChange(-1);
          } else if (pullSide.current === "right" && dx < -PULL_THRESHOLD - 50) {
            triggerWeekChange(1);
          }
          
          pullProgress.setValue(0);
          pullSide.current = null;
        },
      }),
    [atLeftEdge, atRightEdge, triggerWeekChange]
  );

  const getPlansForDayAndHour = (dayIndex: number, hour: number) => {
    const targetDate = new Date(startDay || new Date());
    targetDate.setDate(targetDate.getDate() + dayIndex);
    
    return plans.filter(plan => {
      const planDate = new Date(plan.startTime);
      const planHour = planDate.getHours();
      return planDate.toDateString() === targetDate.toDateString() && planHour === hour;
    });
  };

  return (
    <View style={styles.container} onLayout={onOuterLayout}>
      {/* 헤더 */}
      <ScrollView
        ref={headerRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.timeColumn} />
          {DAY_LABEL.slice(0, visibleDays).map((day, index) => (
            <View key={index} style={[styles.dayHeader, { width: colWidth }]}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 본문 */}
      <ScrollView
        ref={horizRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScrollX}
        style={styles.body}
        {...panResponder.panHandlers}
      >
        <View style={[styles.bodyContent, { width: totalColsW }]}>
          {/* 시간 열 */}
          <View style={styles.timeColumn}>
            {hours.map(hour => (
              <View key={hour} style={[styles.timeSlot, { height: hourHeight }]}>
                <Text style={styles.timeText}>{hour}:00</Text>
              </View>
            ))}
          </View>

          {/* 일정 그리드 */}
          {DAY_LABEL.slice(0, visibleDays).map((_, dayIndex) => (
            <View key={dayIndex} style={[styles.dayColumn, { width: colWidth }]}>
              {hours.map(hour => {
                const dayPlans = getPlansForDayAndHour(dayIndex, hour);
                return (
                  <View key={hour} style={[styles.timeSlot, { height: hourHeight }]}>
                    {dayPlans.map(plan => (
                      <EventBlock
                        key={plan.planId}
                        title={plan.title}
                        time={`${new Date(plan.startTime).getHours()}:${String(new Date(plan.startTime).getMinutes()).padStart(2, '0')}`}
                        location={plan.place}
                        onPress={() => onPressPlan?.(plan)}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    height: '100%',
  },
  timeColumn: {
    width: GUTTER,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  dayHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    flexDirection: 'row',
  },
  dayColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  timeSlot: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
