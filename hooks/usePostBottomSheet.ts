import { SERVER_URL } from '@/constants/server';
import type { PlanDetailEntity } from '@/types/entity/PlanDetailEntity';
import type { PlanEntity } from '@/types/entity/PlanEntity';
import { useCallback, useState } from 'react';

export const usePostBottomSheet = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanEntity | null>(null);
  const [planDetail, setPlanDetail] = useState<PlanDetailEntity | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 일정 상세 정보 가져오기
  const fetchPlanDetail = useCallback(async (planId: number) => {
    try {
      setIsLoadingDetail(true);
      const response = await fetch(`${SERVER_URL}/api/v1/plans/${planId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const detailData: PlanDetailEntity = await response.json();
        setPlanDetail(detailData);
        console.log('계획 상세 정보 받음:', detailData);
      } else {
        console.error('계획 상세 정보 요청 실패:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('계획 상세 정보 가져오기 에러:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // BottomSheet 열기
  const openBottomSheet = useCallback((plan: PlanEntity) => {
    setSelectedPlan(plan);
    
    // 일정 포스트 상세 정보 통신
    if (plan.planId) {
      fetchPlanDetail(plan.planId);
    }

    setIsVisible(true);
  }, [fetchPlanDetail]);

  // BottomSheet 닫기
  const closeBottomSheet = useCallback(() => {
    setIsVisible(false);
    setSelectedPlan(null);
    setPlanDetail(null);
    setIsLoadingDetail(false);
  }, []);

  return {
    isVisible,
    selectedPlan,
    planDetail,
    isLoadingDetail,
    openBottomSheet,
    closeBottomSheet,
  };
};
