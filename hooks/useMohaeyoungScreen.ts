// src/hooks/useMohaeyoung.ts
import { SERVER_URL } from "@/constants/server";
import { getToken } from "@/contexts/tokenManager";
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

export function useMohaeyoung({ serverUrl = SERVER_URL, useMock = false, token, currentUser: initialCurrentUser }: Options = {}) {
  const [friends, setFriends] = useState<UserDTO[]>([]);
  const [plans, setPlans] = useState<Record<number, PlanEntity[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(initialCurrentUser || null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 현재 주에서의 오프셋 (0=현재주, -1=이전주, 1=다음주)
  const { loggedUser } = useUser();

  // 토큰 초기화
  useEffect(() => {
    const initToken = async () => {
      const token = await getToken();
      setAuthToken(token);
    };
    initToken();
  }, []);

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

  // 주차 오프셋을 적용한 주의 시작일과 끝일 계산
  const getWeekRangeWithOffset = useCallback((offset: number = 0) => {
    const { startDay, endDay } = getCurrentWeekRange();
    
    const adjustedStartDay = new Date(startDay);
    adjustedStartDay.setDate(startDay.getDate() + (offset * 7));
    
    const adjustedEndDay = new Date(endDay);
    adjustedEndDay.setDate(endDay.getDate() + (offset * 7));
    
    return { startDay: adjustedStartDay, endDay: adjustedEndDay };
  }, [getCurrentWeekRange]);

  // 현재 주차 정보 계산 (몇 번째 주, 날짜 범위)
  const getCurrentWeekInfo = useCallback(() => {
    const { startDay, endDay } = getWeekRangeWithOffset(currentWeekOffset);
    
    // 년도와 월 정보
    const year = startDay.getFullYear();
    const month = startDay.getMonth() + 1;
    
    // 해당 월의 첫 번째 날
    const firstDayOfMonth = new Date(year, startDay.getMonth(), 1);
    const firstDayWeekday = firstDayOfMonth.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    
    // 월요일을 주의 시작으로 하므로 조정
    const adjustedFirstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
    
    // 해당 주가 그 달의 몇 번째 주인지 계산
    const weekOfMonth = Math.ceil((startDay.getDate() + adjustedFirstDayWeekday) / 7);
    
    // 날짜 포맷팅
    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    };
    
    return {
      weekLabel: `${month}월 ${weekOfMonth}째 주`,
      dateRange: `${formatDate(startDay)} ~ ${formatDate(endDay)}`,
      startDay,
      endDay
    };
  }, [currentWeekOffset, getWeekRangeWithOffset]);

  // 주 변경 함수
  const changeWeek = useCallback((direction: 'prev' | 'next') => {
    setCurrentWeekOffset(prev => {
      if (direction === 'prev') {
        return prev - 1;
      } else {
        return prev + 1;
      }
    });
  }, []);

  // currentUser가 변경될 때 주차를 오늘 기준으로 리셋
  const resetWeekToToday = useCallback(() => {
    setCurrentWeekOffset(0);
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
        const apiUrl = (friendId === loggedUser?.userId) ? `${serverUrl}/api/v1/home/plans/my` : `${serverUrl}/api/v1/friends/${friendId}/plans`;
        console.log('apiUrl:', apiUrl);
        const res = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${await getToken()}`,
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = (await res.json()) as PlanEntity[];
        data.forEach(plan => {
          plan.new = true;
        });
        console.log('fetchPlans data:', data);
      }

      setPlans(prev => ({ ...prev, [friendId]: data }));
    } catch (e) {
      console.error('Failed to fetch plans:', e);
      setError(e);
    }
  }, [serverUrl, authToken, useMock, loggedUser]);

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
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${await getToken()}`,
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
              'Authorization': `Bearer ${await getToken()}`,
            },
          });
          const isNew  = await res.json(); // true/false 응답
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
                const res = await fetch(`${serverUrl}/api/v1/friends/${friend.id}/plans/week`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${await getToken()}`,
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
  }, [endpointFriends, serverUrl, useMock]);

  useEffect(() => {
    fetchDatas();
    console.log('useEffect currentPlan:', plans[currentUser?.id || 0]);
  }, [fetchDatas]);

  const onItemPress = useCallback((u: UserDTO) => {
    console.log("clicked:", u.id, u.name);
    // 필요 시 여기서 네비게이션/상세로 이동
  }, []);

  const setCurrentUserTo = useCallback((user: UserDTO) => {
    console.log("|||||Setting current user to:", user.name);
    setCurrentUser(user);
    resetWeekToToday(); // 사용자가 변경되면 오늘 기준으로 주차 리셋
  }, [resetWeekToToday]);

  return {
    currentUser,
    friends,
    plans,
    loading,
    error,
    getCurrentWeekRange,
    getCurrentWeekInfo,
    changeWeek,
    resetWeekToToday,
    refetch: fetchDatas,
    fetchPlans,
    onItemPress,
    setCurrentUserTo,
  };
}
