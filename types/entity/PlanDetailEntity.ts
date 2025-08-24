export type PlanDetailEntity = {
  planId: number;
  authorId: number[];
  authorName: string[];
  title: string;
  content: string;
  imageUrl: string;
  place: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  hasSavingsGoal: boolean;
  savingsAmount: number;
  privacyLevel: 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY';
  commentCount: number;
};