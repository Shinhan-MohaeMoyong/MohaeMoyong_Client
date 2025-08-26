// hooks/useFriendRequests.ts
import { SERVER_URL } from "@/constants/server";
import { DEFAULT_TOKEN } from "@/contexts/tokenManager";
import { useEffect, useState } from "react";

export type FriendRequest = {
  requestId: number; // 요청 고유 ID
  userId: number; // 요청 보낸 사람 id
  name: string; // 요청 보낸 사람 이름
  avatar: string; // 요청 보낸 사람 프로필 이미지 (카톡)
  bio?: string; // 요청 메시지
};

export function useFriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  // 공통 fetch
  const authedRequest = async (path: string, options?: RequestInit) => {
    const res = await fetch(`${SERVER_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEFAULT_TOKEN}`,
        ...(options?.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.status === 204) return null; // No Content
    return res.json();
  };

  // 📌 받은 요청 목록 불러오기 (Inbox)
  const loadInbox = async () => {
    try {
      const json = await authedRequest(`/api/v1/friends/requests/inbox`);
      console.log("📥 받은 요청 목록:", json);

      setRequests(
        (json as any[]).map((r) => ({
          requestId: r.requestId,
          userId: r.requesterId, // 요청 보낸 사람 ID
          name: r.requesterName, // 요청 보낸 사람 이름
          avatar: r.requesterImgUrl || "", // ✅ 서버에서 내려주는 카톡 프로필
          bio: r.message,
        }))
      );
    } catch (e) {
      console.error("❌ 친구 요청 불러오기 실패:", e);
      setRequests([]);
    }
  };

  // 📌 요청 수락
  const confirmRequest = async (requestId: number) => {
    try {
      await authedRequest(`/api/v1/friends/requests/${requestId}/accept`, {
        method: "POST",
      });
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      alert("친구 요청을 수락했습니다.");
    } catch (e) {
      console.error("❌ 친구 요청 수락 실패:", e);
      alert("친구 요청 수락에 실패했습니다.");
    }
  };

  // 📌 요청 거절
  const deleteRequest = async (requestId: number) => {
    try {
      await authedRequest(`/api/v1/friends/requests/${requestId}/decline`, {
        method: "POST",
      });
      setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      alert("친구 요청을 거절했습니다.");
    } catch (e) {
      console.error("❌ 친구 요청 거절 실패:", e);
      alert("친구 요청 거절에 실패했습니다.");
    }
  };

  // 처음 로드 시 inbox 불러오기
  useEffect(() => {
    loadInbox();
  }, []);

  return { requests, confirmRequest, deleteRequest, reload: loadInbox };
}
