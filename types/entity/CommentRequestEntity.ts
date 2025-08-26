export interface CommentPhotoRequest {
  url: string;
  orderNo: number;
}

export interface CommentRequestEntity {
  content: string;
  photos?: CommentPhotoRequest[] | null;
}
