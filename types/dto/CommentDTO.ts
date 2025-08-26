import type { UserDTO } from './UserDTO';

export interface CommentDTO {
  id: string;
  user: string;
  time: string;
  text: string;
  userImageUrl?: string;
  photos?: string[];
  userDTO: UserDTO;
}
