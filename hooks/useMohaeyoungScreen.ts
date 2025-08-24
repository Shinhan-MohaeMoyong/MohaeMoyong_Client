// src/hooks/useMohaeyoung.ts
import { SERVER_URL, TOKEN } from "@/constants/server";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dataFetchFriends } from "../constants/localData/friendsListData";
import { dataFetchPlans } from "../constants/localData/PlanData";
import { useUser } from "../contexts/UserContext";
import { toUserDTO, toUserDTOList } from "../mappers/userMapper";
import type { UserDTO } from "../types/dto";
import type { FriendEntity, PlanEntity } from "../types/entity";

type Options = {
  serverUrl?: string;
  useMock?: boolean;
  token?: string; // JWT 필요 시
  currentUser?: UserDTO;
};

export function useMohaeyoung({ serverUrl = SERVER_URL, useMock = false, token = TOKEN, currentUser: initialCurrentUser }: Options = {}) {
  const [friends, setFriends] = useState<UserDTO[]>([]);
  const [plans, setPlans] = useState<Record<number, PlanEntity[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(initialCurrentUser || null);
  const { loggedUser } = useUser();

  // currentUser가 변경될 때마다 해당 사용자의 일정을 가져오기
  useEffect(() => {
    if (currentUser) {
      console.log('currentUser Change : ', currentUser);
      fetchPlans(currentUser.id);
    }
  }, [currentUser]);

  // 현재 주의 시작일과 끝일 계산 (월요일 ~ 일요일)
  const getCurrentWeekRange = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일

    // 월요일을 주의 시작으로 설정
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // 일요일을 주의 끝으로 설정 (월요일 + 6일)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { startDay: monday, endDay: sunday };
  }, []);

  const endpointFriends = useMemo(() => `${serverUrl}/api/v1/friends`, [serverUrl]);

  const fetchPlans = useCallback(async (friendId: number) => {
    try {
      let data: PlanEntity[];

      if (useMock) {
        // 1) 목 데이터
        data = await dataFetchPlans();
      } else {
        // 2) 실 서버 통신
        const apiUrl = (friendId === loggedUser?.userId) ? `${serverUrl}/api/v1/home/plans/week/myPlans` : `${serverUrl}/api/v1/friends/${friendId}/plans`;
        const res = await fetch(apiUrl, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = (await res.json()) as PlanEntity[];
        console.log('fetchPlans data:', data);
      }

      setPlans(prev => ({ ...prev, [friendId]: data }));
    } catch (e) {
      console.error('Failed to fetch plans:', e);
      setError(e);
    }
  }, [serverUrl, token, useMock]);

  const fetchDatas = useCallback(async () => {
    setFriends([]);
    setLoading(true);
    setError(null);
    try {
      let data: UserDTO[];

      if (useMock) {
        // 1) 목 데이터
        data = await dataFetchFriends();
      } else {
        // loggedUser를 friends에 추가 (중복 방지)
        if (loggedUser) {
          const userDTO = toUserDTO(loggedUser);
          setFriends(prev => [userDTO]);
        }
        
        const res = await fetch(endpointFriends, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const entities = (await res.json()) as FriendEntity[];
        // 서버엔 isNew 없음 → DTO 변환 후 기본 false
        data = toUserDTOList(entities);
        console.log('friends data:', data);
      }

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
          console.log("isNew:", isNew);
          return { ...u, isNew };
        })
      );

      setFriends(prev => [...prev, ...mapped]);

      // 친구 목록을 받아온 후 모든 친구의 일정을 가져와서 친구별로 저장
      if (mapped.length > 0) {
        const plansByFriend: Record<number, PlanEntity[]> = {};

        await Promise.all(
          mapped.map(async (friend) => {
            try {
              let friendPlans: PlanEntity[];

              if (useMock) {
                // 목 데이터 사용
                friendPlans = await dataFetchPlans();
              } else {
                // 실제 서버 통신
                const res = await fetch(`${serverUrl}/api/v1/friends/${friend.id}/plans`, {
                  headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                friendPlans = (await res.json()) as PlanEntity[];
              }

              // 친구 ID를 키로 해서 일정 저장
              plansByFriend[friend.id] = friendPlans;
              console.log('||| plansByFriend:', plansByFriend);
            } catch (e) {
              console.error(`Failed to fetch plans for friend ${friend.id}:`, e);
              // 에러 발생 시 빈 배열로 설정
              plansByFriend[friend.id] = [];
            }
          })
        );

        setPlans(prev => ({ ...prev, ...plansByFriend }));
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [endpointFriends, serverUrl, token, useMock]); // loggedUser 의존성 제거

  useEffect(() => {
    // loggedUser가 있을 때만 fetchDatas 호출
    if (loggedUser) {
      fetchDatas();
    }
  }, [loggedUser, fetchDatas]);

  useEffect(() => {
    console.log('useEffect currentPlan:', plans[currentUser?.id || 0]);
  }, [plans, currentUser]);

  useEffect(() => {
    console.log('useEffect currentUser:', currentUser);
  }, [currentUser]);

  useEffect(() => {
    console.log('useEffect plan:', plans);
  }, [plans]);

  const onItemPress = useCallback((u: UserDTO) => {
    console.log("clicked:", u.id, u.name);
    // 필요 시 여기서 네비게이션/상세로 이동
  }, []);

  const setCurrentUserTo = useCallback((user: UserDTO) => {
    console.log("|||||Setting current user to:", user.name);
    setCurrentUser(user);
  }, []);

  return {
    currentUser,
    friends,
    plans,
    loading,
    error,
    getCurrentWeekRange,
    refetch: fetchDatas,
    fetchPlans,
    onItemPress,
    setCurrentUserTo,
  };
}
