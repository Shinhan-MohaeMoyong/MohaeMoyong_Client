// hooks/useFriends.ts
import { SERVER_URL } from "@/constants/server";
import { DEFAULT_TOKEN } from "@/contexts/tokenManager";
import { useEffect, useMemo, useRef, useState } from "react";

export type RowItem = {
  id: number; // 유저 id
  name: string;
  avatar: string;
  requestId?: number; // 요청 id (있으면 Outbox/Inbox)
};

export function useFriends() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"friends" | "requests">("friends");
  const [data, setData] = useState<RowItem[]>([]);
  const [primaryLabel, setPrimaryLabel] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isSearchActive, setSearchActive] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 공통 GET
  const authedGet = async <T>(path: string): Promise<T> => {
    const res = await fetch(`${SERVER_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEFAULT_TOKEN}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  };

  // 공통 POST/DELETE
  const authedRequest = async <T>(path: string, options: RequestInit): Promise<T> => {
    const res = await fetch(`${SERVER_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEFAULT_TOKEN}`,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  };

  // 서버 응답 → RowItem 변환
  const mapToRow = (u: any): RowItem | null => {
    // Outbox (내가 보낸 요청)
    if (u?.receiverId && u?.requestId) {
      return {
        id: u.receiverId,
        name: u.receiverName,
        avatar: u?.receiverImgUrl || "", // ✅ 수신자 프로필
        requestId: u.requestId,
      };
    }
    // Inbox (내가 받은 요청) - 필요 시 참고
    if (u?.requesterId && u?.requestId) {
      return {
        id: u.requesterId,
        name: u.requesterName,
        avatar: u?.requesterImgUrl || "", // ✅ 요청자 프로필
        requestId: u.requestId,
      };
    }
    // 일반 친구
    const id = u?.id ?? u?.userId;
    const name = u?.name ?? u?.username;
    if (id == null || !name) return null;
    return { id, name, avatar: u?.imageUrl || "" };
  };

  // 📌 목록 조회
  const loadFriends = async () => {
    setLoading(true);
    try {
      const json = await authedGet<any[]>(`/api/v1/friends`);
      setData(json.map(mapToRow).filter(Boolean) as RowItem[]);
      setPrimaryLabel(undefined); // 기본: 친구 삭제
    } catch (e) {
      console.error("친구 목록 불러오기 실패:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const json = await authedGet<any[]>(`/api/v1/users`);
      setData(json.map(mapToRow).filter(Boolean) as RowItem[]);
      setPrimaryLabel("요청 보내기");
    } catch (e) {
      console.error("전체 사용자 불러오기 실패:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (q: string) => {
    setLoading(true);
    try {
      const json = await authedGet<any[]>(`/api/v1/users`);
      const filtered = json.filter((u) => (u.username ?? u.name ?? "").includes(q));
      setData(filtered.map(mapToRow).filter(Boolean) as RowItem[]);
      setPrimaryLabel("요청 보내기");
    } catch (e) {
      console.error("사용자 검색 실패:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOutbox = async () => {
    setLoading(true);
    try {
      const json = await authedGet<any[]>(`/api/v1/friends/requests/outbox`);
      setData(json.map(mapToRow).filter(Boolean) as RowItem[]);
      setPrimaryLabel("요청 취소");
    } catch (e) {
      console.error("친구 요청 outbox 불러오기 실패:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 📌 행위 API들
  const sendFriendRequest = async (receiverId: number, message: string) => {
    return authedRequest(`/api/v1/friends/requests`, {
      method: "POST",
      body: JSON.stringify({ receiverId, message }),
    });
  };

  const cancelFriendRequest = async (requestId: number) => {
    return authedRequest(`/api/v1/friends/requests/${requestId}/cancel`, {
      method: "POST",
    });
  };

  const deleteFriend = async (friendId: number) => {
    return authedRequest(`/api/v1/friends/${friendId}`, {
      method: "DELETE",
    });
  };

  // 📌 분기 로직
  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    setData([]);

    if (tab === "friends") {
      debRef.current = setTimeout(() => void loadFriends(), 0);
      return;
    }

    if (isSearchActive) {
      const q = query.trim();
      if (q) {
        debRef.current = setTimeout(() => void searchUsers(q), 250);
      } else {
        debRef.current = setTimeout(() => void loadAllUsers(), 0);
      }
    } else {
      debRef.current = setTimeout(() => void loadOutbox(), 0);
    }
  }, [tab, isSearchActive, query]);

  // 필터링
  const filtered = useMemo(() => {
    if (tab !== "friends" || !query.trim()) return data;
    return data.filter((u) => u.name.includes(query.trim()));
  }, [data, query, tab]);

  return {
    tab,
    setTab,
    query,
    setQuery,
    data: filtered,
    primaryLabel,
    loading,
    isSearchActive,
    setSearchActive,
    sendFriendRequest,
    cancelFriendRequest,
    deleteFriend,
  };
}