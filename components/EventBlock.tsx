import { useEventBlock } from '@/hooks/useEventBlock';
import type { PlanEntity } from '@/types/entity/PlanEntity';
import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  plan: PlanEntity;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  onPress?: (plan: PlanEntity, e: GestureResponderEvent) => void;
};

export default function EventBlock({ plan, rect, onPress }: Props) {
  // ViewModel 로직을 훅으로 분리
  const { eventBlockStyle, shouldShowMeta } = useEventBlock(plan);

  return (
    <Pressable 
      onPress={(e) => onPress?.(plan, e)} 
      style={[styles.wrap, rect, eventBlockStyle]}
    >
      <View style={styles.inner}>
        <Text numberOfLines={1} style={styles.title}>{plan.title}</Text>
        {shouldShowMeta && (
          <Text numberOfLines={1} style={styles.meta}>{plan.place}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    borderRadius: 5,
    padding: 8,
    overflow: "hidden",
  },
  inner: {
    gap: 2,
    marginTop:-2,
    marginLeft:-2
  },
  title: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
    includeFontPadding: false,
  },
  meta: {
    fontSize: 8,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    includeFontPadding: false,
  },
});
