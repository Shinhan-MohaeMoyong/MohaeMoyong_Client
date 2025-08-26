export interface CommentPhoto {
  photoUrl: string;
  orderNo: number;
}

export interface CommentEntity {
  commentId: number;
  userId: number;
  userName: string;
  userImageUrl?: string;
  content: string;
  createdAt: string;
  photos: CommentPhoto[];
}
