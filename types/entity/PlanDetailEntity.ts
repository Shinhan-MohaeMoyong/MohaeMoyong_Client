export type PlanDetailEntity = {
  planId: number;
  authorId: number[];
  authorName: string[];
  title: string;
  content: string;
  photos: PhotoPostEntity[];
  place: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  hasSavingsGoal: boolean;
  savingsAmount: number;
  privacyLevel: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  commentCount: number;
};

export type PhotoPostEntity = {
  photoId: number;
  url: string;
  orderNo: number;
  width: number;
  height: number;
};