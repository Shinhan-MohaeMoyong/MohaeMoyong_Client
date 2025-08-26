import { SERVER_URL } from '@/constants/server';
import { getToken } from '@/contexts/tokenManager';
import { mapPlanDetailToPostBottomSheet } from '@/mappers/planDetailMapper';
import type { CommentDTO } from '@/types/dto/CommentDTO';
import type { PostBottomSheetDTO } from '@/types/dto/PostBottomSheetDTO';
import type { CommentEntity } from '@/types/entity/CommentEntity';
import type { PlanDetailEntity } from '@/types/entity/PlanDetailEntity';
import type { PlanEntity } from '@/types/entity/PlanEntity';
import { useCallback, useState } from 'react';
import { useMohaeyoung } from './useMohaeyoungScreen';

export const usePostBottomSheet = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanEntity | null>(null);
  const [planDetail, setPlanDetail] = useState<PlanDetailEntity | null>(null);
  const [postBottomSheetData, setPostBottomSheetData] = useState<PostBottomSheetDTO | null>(null);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const { friends } = useMohaeyoung();



  // 댓글 가져오기 함수
  const fetchComments = useCallback(async (planId: number) => {
    try {
      setIsLoadingComments(true);
      console.log('💬 === 댓글 정보 요청 ===');
      console.log('일정 ID:', planId);
      
      const response = await fetch(`${SERVER_URL}/api/v1/plans/${planId}/comments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`댓글 정보 요청 실패: ${response.status} ${response.statusText}`);
      }
      
      const commentResponse = await response.json();
      console.log('💬 === 댓글 정보 응답 ===');
      console.log(JSON.stringify(commentResponse, null, 2));
      
      // CommentEntity를 CommentDTO로 변환
      const commentDTOs: CommentDTO[] = commentResponse.content.map((comment: CommentEntity) => {
        // friends 배열에서 해당 사용자의 UserDTO 찾기
        const authorUser = friends.find(friend => friend.id === comment.userId);
        
        return {
          id: String(comment.commentId),
          user: comment.userName,
          time: formatTimeAgo(comment.createdAt),
          text: comment.content,
          userImageUrl: comment.userImageUrl,
          photos: comment.photos?.map(photo => photo.photoUrl) || [],
          userDTO: authorUser || {
            id: comment.userId,
            name: comment.userName,
            email: 'unknown@example.com',
            imageUrl: comment.userImageUrl || null
          }
        };
      });
      
      setComments(commentDTOs);
      console.log('💬 === 댓글 정보 변환 결과 ===');
      console.log(JSON.stringify(commentDTOs, null, 2));
      
    } catch (error) {
      console.error('❌ 댓글 정보 가져오기 실패:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  }, []);

  // 시간 포맷팅 함수
  const formatTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const commentTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - commentTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  // 통합된 openBottomSheet 함수
  const openBottomSheet = useCallback(async (plan: PlanEntity) => {
    try {
      setIsLoadingDetail(true);
      console.log('📋 === 일정 상세 정보 요청 ===');
      console.log('일정 ID:', plan.planId);
      
      // 일정 상세 정보 가져오기
      const response = await fetch(`${SERVER_URL}/api/v1/plans/${plan.planId}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${await getToken()}`,
              'Content-Type': 'application/json',
          },
      });
      
      if (!response.ok) {
          throw new Error(`일정 상세 정보 요청 실패: ${response.status} ${response.statusText}`);
      }
      
      const planDetail: PlanDetailEntity = await response.json();
      console.log('📋 === 일정 상세 정보 응답 ===');
      console.log(JSON.stringify(planDetail, null, 2));
      
      // PlanDetailEntity를 PostBottomSheetDTO로 변환
      const postBottomSheetData: PostBottomSheetDTO = mapPlanDetailToPostBottomSheet(
          planDetail,
          friends
      );
      
      console.log('📋 === PostBottomSheetDTO 변환 결과 ===');
      console.log(JSON.stringify(postBottomSheetData, null, 2));
      
      // PostBottomSheet 열기
      setPostBottomSheetData(postBottomSheetData);
      setSelectedPlan(plan);
      setIsVisible(true);
      
      // 댓글도 함께 가져오기
      await fetchComments(plan.planId);
      
  } catch (error) {
      console.error('❌ 일정 상세 정보 가져오기 실패:', error);
      // 에러 시 기존 방식으로 fallback
  } finally {
      setIsLoadingDetail(false);
  }
  }, [fetchComments, friends]);

  // BottomSheet 닫기
  const closeBottomSheet = useCallback(() => {
    setIsVisible(false);
    setSelectedPlan(null);
    setPlanDetail(null);
    setPostBottomSheetData(null);
    setComments([]);
    setIsLoadingDetail(false);
    setIsLoadingComments(false);
  }, []);

  return {
    isVisible,
    selectedPlan,
    planDetail,
    postBottomSheetData,
    comments,
    isLoadingDetail,
    isLoadingComments,
    openBottomSheet,
    closeBottomSheet,
    fetchComments,
  };
};
