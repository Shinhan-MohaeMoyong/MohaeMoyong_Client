// mappers/userMapper.ts
import type { UserDTO } from "../types/dto/UserDTO";
import type { FriendEntity } from "../types/entity/FriendEntity";
import type { UserEntity } from "../types/entity/UserEntity";

// 함수 오버로딩 시그니처 선언
export function toUserDTO(entity: FriendEntity): UserDTO;
export function toUserDTO(entity: UserEntity): UserDTO;
export function toUserDTO(entity: FriendEntity | UserEntity): UserDTO {
  // FriendEntity인 경우
  if ('id' in entity && 'name' in entity) {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      imageUrl: entity.imageUrl,
      isNew: false,
    };
  }
  
  // UserEntity인 경우
  return {
    id: entity.userId,
    name: entity.username,
    email: entity.email,
    imageUrl: entity.imageUrl,
    isNew: false,
  };
}

export function toUserDTOList(entities: FriendEntity[]): UserDTO[] {
  return entities.map(toUserDTO);
}
