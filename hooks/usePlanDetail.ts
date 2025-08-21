import type { PlanEntity } from '@/types/entity/PlanEntity';
import { useCallback, useMemo } from 'react';

export const usePlanDetail = (plan: PlanEntity | null) => {
  // 일정 시간 포맷팅
  const formattedTime = useMemo(() => {
    if (!plan) return '';
    
    const start = new Date(plan.startTime);
    const end = new Date(plan.endTime);
    
    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  }, [plan]);

  // 일정 날짜 포맷팅
  const formattedDate = useMemo(() => {
    if (!plan) return '';
    
    const date = new Date(plan.startTime);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    
    return date.toLocaleDateString('ko-KR', options);
  }, [plan]);

  // 일정 기간 계산 (분 단위)
  const durationMinutes = useMemo(() => {
    if (!plan) return 0;
    
    const start = new Date(plan.startTime);
    const end = new Date(plan.endTime);
    
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  }, [plan]);

  // 일정 기간 포맷팅
  const formattedDuration = useMemo(() => {
    if (durationMinutes < 60) {
      return `${durationMinutes}분`;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (minutes === 0) {
      return `${hours}시간`;
    }
    
    return `${hours}시간 ${minutes}분`;
  }, [durationMinutes]);

  // 수정 버튼 클릭 핸들러
  const handleEdit = useCallback(() => {
    if (!plan) return;
    console.log('일정 수정:', plan.title);
    // TODO: 수정 모달 또는 화면으로 이동
  }, [plan]);

  // 공유 버튼 클릭 핸들러
  const handleShare = useCallback(() => {
    if (!plan) return;
    console.log('일정 공유:', plan.title);
    // TODO: 공유 기능 구현
  }, [plan]);

  // 삭제 버튼 클릭 핸들러
  const handleDelete = useCallback(() => {
    if (!plan) return;
    console.log('일정 삭제:', plan.title);
    // TODO: 삭제 확인 모달 표시
  }, [plan]);

  // 액션 버튼들 데이터
  const actionButtons = useMemo(() => [
    {
      id: 'edit',
      icon: '✏️',
      text: '수정',
      onPress: handleEdit,
      style: 'primary'
    },
    {
      id: 'share',
      icon: '📤',
      text: '공유',
      onPress: handleShare,
      style: 'primary'
    },
    {
      id: 'delete',
      icon: '🗑️',
      text: '삭제',
      onPress: handleDelete,
      style: 'danger'
    }
  ], [handleEdit, handleShare, handleDelete]);

  return {
    formattedTime,
    formattedDate,
    formattedDuration,
    actionButtons,
    handleEdit,
    handleShare,
    handleDelete,
  };
};
