import type { PostBottomSheetDTO } from '../types/dto/PostBottomSheetDTO';
import type { UserDTO } from '../types/dto/UserDTO';
import type { PlanDetailEntity } from '../types/entity/PlanDetailEntity';

export const mapPlanDetailToPostBottomSheet = (
  planDetail: PlanDetailEntity,
  friends: UserDTO[]
): PostBottomSheetDTO => {
  // friends 데이터에서 작성자 정보 찾기
  const author = friends.find(friend => friend.id === planDetail.authorId);
  
  return {
    // 헤더 정보 (작성자 정보)
    authorDTO: author || { id: 1, name: '사용자', email: 'me@example.com', imageUrl: null },
    
    // 일정 정보
    planId: planDetail.planId,
    title: planDetail.title,
    content: planDetail.content,
    place: planDetail.place,
    startTime: planDetail.startTime,
    endTime: planDetail.endTime,
    isCompleted: planDetail.isCompleted,
    
    // 이미지 정보
    imageUrl: planDetail.imageUrl,
    photos: planDetail.photos.map(photo => ({
      photoId: photo.photoId,
      url: photo.url,
      orderNo: photo.orderNo,
      width: photo.width,
      height: photo.height
    })),
    
    // 저축 정보
    hasSavingsGoal: planDetail.hasSavingsGoal,
    savingsAmount: planDetail.savingsAmount,
    
    // 기타 정보
    privacyLevel: planDetail.privacyLevel,
    commentCount: planDetail.commentCount
  };
};
