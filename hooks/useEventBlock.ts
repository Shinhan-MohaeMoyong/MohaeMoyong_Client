import type { PlanEntity } from '@/types/entity/PlanEntity';
import { useCallback, useMemo } from 'react';

export const useEventBlock = (plan: PlanEntity) => {
  // 색상 팔레트 정의
  const palette = useMemo(() => [
    "#F08676", "#FCAA67", "#A7C970", "#7CD1C1", "#7AA5E9",
  ], []);

  // 단순 해시 함수
  const hashCode = useCallback((s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return h;
  }, []);

  // 제목 기반 안정적인 색상 선택
  const backgroundColor = useMemo(() => {
    const key = (plan.title || plan.planId || "").toString();
    const idx = Math.abs(hashCode(key)) % palette.length;
    return palette[idx];
  }, [plan.title, plan.planId, palette]);

  

  // 이벤트 블록 스타일 계산
  const eventBlockStyle = useMemo(() => ({
    backgroundColor,
    borderRadius: 0,
    padding: 8,
    overflow: 'hidden' as const,
  }), [backgroundColor]);

  // 메타데이터 표시 여부
  const shouldShowMeta = useMemo(() => !!plan.place, [plan.place]);

  return {
    backgroundColor,
    eventBlockStyle,
    shouldShowMeta,
  };
};
