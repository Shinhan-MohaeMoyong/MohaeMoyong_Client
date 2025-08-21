import type { PlanEntity } from '@/types/entity/PlanEntity';
import { useCallback, useState } from 'react';

export const useBottomSheet = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanEntity | null>(null);

  // BottomSheet 열기
  const openBottomSheet = useCallback((plan: PlanEntity) => {
    setSelectedPlan(plan);
    setIsVisible(true);
  }, []);

  // BottomSheet 닫기
  const closeBottomSheet = useCallback(() => {
    setIsVisible(false);
    setSelectedPlan(null);
  }, []);

  return {
    isVisible,
    selectedPlan,
    openBottomSheet,
    closeBottomSheet,
  };
};
