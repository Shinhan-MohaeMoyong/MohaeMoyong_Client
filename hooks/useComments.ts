// hooks/useComments.ts
import { SERVER_URL } from "@/constants/server";
import { getToken } from "@/contexts/tokenManager";
import type { CommentRequestEntity } from "@/types/entity/CommentRequestEntity";
import { useState } from "react";
import { Alert } from "react-native";

/**
 * 댓글 관련 API Hook
 */
export function useComments(planId: number) {
  const [loading, setLoading] = useState(false);

  const patchComment = async (commentId: number, payload: Partial<CommentRequestEntity>) => {
    try {
      setLoading(true);
      const token = await getToken();

      const res = await fetch(`${SERVER_URL}/api/v1/plans/${planId}/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(`댓글 수정 실패 (${res.status}) ${err ? JSON.stringify(err) : ""}`);
      }

      return await res.json().catch(() => null); // 서버가 body 없는 경우 대비
    } catch (e: any) {
      Alert.alert("오류", e.message ?? "댓글 수정 중 오류가 발생했습니다.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      setLoading(true);
      const token = await getToken();

      const res = await fetch(`${SERVER_URL}/api/v1/plans/${planId}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(`댓글 삭제 실패 (${res.status}) ${err ? JSON.stringify(err) : ""}`);
      }
      return true;
    } catch (e: any) {
      Alert.alert("오류", e.message ?? "댓글 삭제 중 오류가 발생했습니다.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { patchComment, deleteComment, loading };
}
