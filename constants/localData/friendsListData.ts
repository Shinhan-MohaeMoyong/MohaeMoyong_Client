import type { UserDTO } from "@/types/dto/UserDTO";

export const FRIENDS_DATA: UserDTO[] = [
  {
    id: 2,
    name: "홍길동",
    email: "hong@test.com",
    imageUrl: "https://picsum.photos/seed/hong/200/200",
    isNew: true,
  },
  {
    id: 3,
    name: "김철수",
    email: "chulsoo@test.com",
    imageUrl: "https://picsum.photos/seed/chulsoo/200/200",
    isNew: false,
  },
  {
    id: 4,
    name: "이영희",
    email: "lee@test.com",
    imageUrl: "https://picsum.photos/seed/younghee/200/200",
    isNew: true,
  },
];

// 네트워크 딜레이 흉내 (옵션)
export function dataFetchFriends(delayMs = 600): Promise<UserDTO[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(FRIENDS_DATA), delayMs);
  });
}