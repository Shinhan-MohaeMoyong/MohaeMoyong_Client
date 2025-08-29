import { UserDTO } from "./UserDTO";

export interface PostBottomSheetDTO {
  // 헤더 정보 (작성자 정보)
  authorDTO: UserDTO;
  
  // 일정 정보
  planId: number;
  title: string;
  content: string;
  place: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  
  // 이미지 정보
  imageUrl?: string;
  photos: {
    photoId: number;
    url: string;
    orderNo: number;
    width: number;
    height: number;
  }[];
  
  // 저축 정보
  hasSavingsGoal: boolean;
  savingsAmount?: number;
  
  // 기타 정보
  privacyLevel: string;
  commentCount: number;
  
  // 일정 타입 및 참여자 정보
  type: 'PERSONAL' | 'GROUP';
  participantIds?: number[];
}
