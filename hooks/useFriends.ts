// hooks/useFriends.ts
import { SERVER_URL } from "@/constants/server";
import { getToken } from "@/contexts/tokenManager";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type RowItem = {
  id: number; // 유저 id
  name: string;
  avatar: string;
  requestId?: number; // 요청 id (있으면 Outbox/Inbox)
};

export function useFriends() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [tab, setTab] = useState<"friends" | "requests">("friends");
  const [data, setData] = useState<RowItem[]>([]);
  const [primaryLabel, setPrimaryLabel] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [isSearchActive, setSearchActive] = useState(false);

  const acRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);

  // ──────────────────────────────────────────────
  // 디바운스: query → debouncedQuery (250ms)
  // ──────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  // ──────────────────────────────────────────────
  // 공용 GET/REQUEST
  // ──────────────────────────────────────────────
  const authedGet = useCallback(async <T>(path: string): Promise<T> => {
    if (acRef.current) acRef.current.abort();
    const ac = new AbortController();
    acRef.current = ac;

    const res = await fetch(`${SERVER_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      signal: ac.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  }, []);

  const authedRequest = useCallback(async <T>(path: string, options: RequestInit): Promise<T> => {
    if (acRef.current) acRef.current.abort();
    const ac = new AbortController();
    acRef.current = ac;

    const res = await fetch(`${SERVER_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
        ...(options.headers || {}),
      },
      signal: ac.signal,
    });
    if (!res.ok) {
      if (res.status === 204) return {} as T;
      throw new Error(`HTTP ${res.status}`);
    }
    try {
      return (await res.json()) as T;
    } catch {
      return {} as T;
    }
  }, []);

  // ──────────────────────────────────────────────
  // 서버 응답 → RowItem 변환
  // ──────────────────────────────────────────────
  const mapToRow = (u: any): RowItem | null => {
    if (u?.receiverId && u?.requestId) {
      return {
        id: u.receiverId,
        name: u.receiverName,
        avatar: u?.receiverImgUrl || "",
        requestId: u.requestId,
      };
    }
    if (u?.requesterId && u?.requestId) {
      return {
        id: u.requesterId,
        name: u.requesterName,
        avatar: u?.requesterImgUrl || "",
        requestId: u.requestId,
      };
    }
    const id = u?.id ?? u?.userId;
    const name = u?.name ?? u?.username;
    if (id == null || !name) return null;
    return { id, name, avatar: u?.imageUrl || "" };
  };

  const mapRows = useCallback((json: any[]) => {
    return json.map(mapToRow).filter(Boolean) as RowItem[];
  }, []);

  // ──────────────────────────────────────────────
  // 로더들
  // ──────────────────────────────────────────────
  const loadFriends = useCallback(async () => {
    const mySeq = ++seqRef.current;
    setLoading(true);
    try {
      const json = await authedGet<any[]>(`/api/v1/friends`);
      if (mySeq === seqRef.current) {
        setData(mapRows(json));
        setPrimaryLabel(undefined); // 기본: 친구 삭제
      }
    } catch (e) {
      if (mySeq === seqRef.current) setData([]);
      console.error("친구 목록 불러오기 실패:", e);
    } finally {
      if (mySeq === seqRef.current) setLoading(false);
    }
  }, [authedGet, mapRows]);

  const searchUsers = useCallback(
    async (q: string) => {
      const mySeq = ++seqRef.current;
      setLoading(true);
      try {
        const path = q
          ? `/api/v1/friends/search?q=${encodeURIComponent(q)}`
          : `/api/v1/friends/search`;
        const json = await authedGet<any[]>(path);
        if (mySeq === seqRef.current) {
          setData(mapRows(json));
          setPrimaryLabel("요청 보내기");
        }
      } catch (e) {
        if (mySeq === seqRef.current) setData([]);
        console.error("사용자 검색 실패:", e);
      } finally {
        if (mySeq === seqRef.current) setLoading(false);
      }
    },
    [authedGet, mapRows]
  );

  const loadOutbox = useCallback(async () => {
    const mySeq = ++seqRef.current;
    setLoading(true);
    try {
      const json = await authedGet<any[]>(`/api/v1/friends/requests/outbox`);
      if (mySeq === seqRef.current) {
        setData(mapRows(json));
        setPrimaryLabel("요청 취소");
      }
    } catch (e) {
      if (mySeq === seqRef.current) setData([]);
      console.error("친구 요청 outbox 불러오기 실패:", e);
    } finally {
      if (mySeq === seqRef.current) setLoading(false);
    }
  }, [authedGet, mapRows]);

  // ──────────────────────────────────────────────
  // 분기 useEffect
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (tab === "friends") {
      loadFriends();
      return;
    }

    if (tab === "requests") {
      if (isSearchActive) {
        // ✅ 검색창 켜지면 무조건 search API 호출
        searchUsers(debouncedQuery || "");
      } else {
        loadOutbox();
      }
    }
  }, [tab, isSearchActive, debouncedQuery, loadFriends, searchUsers, loadOutbox]);

  // ──────────────────────────────────────────────
  // 클라이언트 필터 (friends 탭에서만)
  // ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (tab !== "friends" || !debouncedQuery) return data;
    return data.filter((u) => u.name.includes(debouncedQuery));
  }, [data, debouncedQuery, tab]);

  // ✅ 현재 화면 상태에 맞춰 다시 로딩하는 공통 함수
  const refreshCurrent = useCallback(async () => {
    if (tab === "friends") {
      await loadFriends();
      return;
    }
    if (tab === "requests") {
      if (isSearchActive) {
        await searchUsers(debouncedQuery || "");
      } else {
        await loadOutbox();
      }
    }
  }, [tab, isSearchActive, debouncedQuery, loadFriends, searchUsers, loadOutbox]);

  // ──────────────────────────────────────────────
  // 행위 API (요청 후 목록 새로고침)
  // ──────────────────────────────────────────────
  const sendFriendRequest = useCallback(
    async (receiverId: number, message: string) => {
      await authedRequest(`/api/v1/friends/requests`, {
        method: "POST",
        body: JSON.stringify({ receiverId, message }),
      });
      await refreshCurrent(); // ✅ 요청 반영해서 다시 로딩
    },
    [authedRequest, refreshCurrent]
  );

  const cancelFriendRequest = useCallback(
    async (requestId: number) => {
      await authedRequest(`/api/v1/friends/requests/${requestId}/cancel`, {
        method: "POST",
      });
      await refreshCurrent(); // ✅ 취소 후 새로고침
    },
    [authedRequest, refreshCurrent]
  );

  const deleteFriend = useCallback(
    async (friendId: number) => {
      await authedRequest(`/api/v1/friends/${friendId}`, {
        method: "DELETE",
      });
      await refreshCurrent(); // ✅ 삭제 후 새로고침
    },
    [authedRequest, refreshCurrent]
  );

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
