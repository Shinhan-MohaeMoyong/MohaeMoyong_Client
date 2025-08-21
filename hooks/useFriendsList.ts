import { dataFetchFriends } from "@/constants/localData/friendsListData";
import { useCallback, useEffect, useState } from "react";
import { SERVER_URL, TOKEN } from "../constants/server";
import type { UserDTO } from "../types/dto/UserDTO";

type UseFriendsOptions = {
  endpointGetFriendsList?: string; // 기본값으로 서버 주소 주거나, Screen에서 주입
  useLocalData?: boolean;
};

export function useFriendsList({
  endpointGetFriendsList = `${SERVER_URL}/api/v1/friends`,
  useLocalData = false
  }: UseFriendsOptions = {}) {
  const [friends, setFriends] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<unknown>(null);

  const fetchFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (useLocalData) {
        const data = await dataFetchFriends();
        setFriends(data);
        return;
      }
      const res = await fetch(endpointGetFriendsList, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      console.log("url : ", endpointGetFriendsList);
      const data = (await res.json()) as Omit<UserDTO, "isNew">[];

      console.log("통신 성공 ", data);
      // 서버엔 isNew 없음 → 기본 false 부여 (규칙 생기면 여기서 계산)
      const mapped: UserDTO[] = await Promise.all(
        data.map(async (u) => {
          const res = await fetch(`${SERVER_URL}/api/v1/friends/${u.id}/plans/new`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`,
              }
            });
          const { isNew } = await res.json(); // true/false 응답
          console.log("isNew:",isNew);
            return { ...u, isNew };
        })
        );
      setFriends(mapped);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [endpointGetFriendsList]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return { friends, loading, error, refetch: fetchFriends };
}
