import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

export type TopTabKey = "계좌" | "일정" | "저축";

type Props = {
  active: TopTabKey;
  onChange?: (key: TopTabKey) => void;
  style?: ViewStyle;

  // 커스텀 옵션
  tabs?: TopTabKey[];          // 기본 ["계좌","일정","저축"]
  fontSize?: number;           // 기본 16
  activeColor?: string;        // 기본 #111827
  inactiveColor?: string;      // 기본 #9CA3AF
  trackColor?: string;         // 기본 #E5E7EB
  indicatorColor?: string;     // 기본 #8C93FF
  indicatorHeight?: number;    // 기본 2
  labelStyle?: TextStyle;
};

export default function TopTabs({
  active,
  onChange,
  style,
  tabs = ["계좌", "일정", "저축"],
  fontSize = 16,
  activeColor = "#111827",
  inactiveColor = "#9CA3AF",
  trackColor = "#E5E7EB",
  indicatorColor = "#8C93FF",
  indicatorHeight = 2,
  labelStyle,
}: Props) {
  const [width, setWidth] = useState(0);
  const tabWidth = useMemo(() => (width > 0 ? width / tabs.length : 0), [width, tabs.length]);
  const activeIndex = useMemo(() => Math.max(0, tabs.indexOf(active)), [tabs, active]);

  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (tabWidth === 0) return;
    Animated.timing(x, {
      toValue: activeIndex * tabWidth,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [activeIndex, tabWidth]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={[styles.wrap, style]} onLayout={onLayout}>
      <View style={styles.row}>
        {tabs.map((label) => {
          const isActive = label === active;
          return (
            <Pressable
              key={label}
              onPress={() => onChange?.(label as TopTabKey)}
              style={styles.item}
              hitSlop={6}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.text,
                  { fontSize },
                  isActive
                    ? { color: activeColor, fontWeight: "700" }
                    : { color: inactiveColor, fontWeight: "600" },
                  labelStyle,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 트랙(전체 밑줄) */}
      <View style={[styles.track, { backgroundColor: trackColor, height: indicatorHeight }]}>
        {/* 보라색 인디케이터 바 */}
        <Animated.View
          style={[
            styles.bar,
            {
              width: tabWidth || 0,
              height: indicatorHeight,
              backgroundColor: indicatorColor,
              transform: [{ translateX: x }],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20, // 친구 화면 톤
    marginTop: 12,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    flexDirection: "row",
    gap: 8,
  },
  text: { letterSpacing: 0.2 },
  track: {
    width: "100%",
    marginTop: 10,
    position: "relative",
  },
  bar: {
    position: "absolute",
    left: 0,
    top: 0,
    borderRadius: 999,
  },
});
