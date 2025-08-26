export interface PlanPhoto {
  photoId: number;
  url: string;
  orderNo: number;
  width: number;
  height: number;
}

export interface PlanDetailEntity {
  planId: number;
  authorId: number;
  authorName: string;
  title: string;
  content: string;
  imageUrl?: string;
  place: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  hasSavingsGoal: boolean;
  savingsAmount?: number;
  privacyLevel: string;
  commentCount: number;
  photos: PlanPhoto[];
}