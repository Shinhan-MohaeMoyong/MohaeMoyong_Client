import { useUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/useComments";
import type { UserDTO } from "@/types/dto";
import type { CommentDTO } from "@/types/dto/CommentDTO";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import UserProfile from "../ui/UserProfile";

type Props = {
  id: string;                  // (사용 중이면 유지)
  planId: number;              // ✅ API 호출용 (필수)
  userDTO: UserDTO;
  comment: CommentDTO;         // comment.id, comment.content, comment.photos[] 등 가정
  time: string;
  text: string;                // 기존 prop도 유지하되, 우선순위는 comment.content
  isAfterPlanEnd?: boolean;
  onUpdated?: () => void;      // ✅ 수정/삭제 후 목록 갱신 콜백
};

export default function CommentItem({
  id,
  planId,
  userDTO,
  comment,
  time,
  text,
  isAfterPlanEnd,
  onUpdated,
}: Props) {
  const { loggedUser } = useUser();
  const isOwnComment = !!loggedUser && userDTO.id === loggedUser.userId;

  const { patchComment, deleteComment, loading } = useComments(planId);

  // 표시용 콘텐츠: comment.content 우선, 없으면 text
  const initialContent = useMemo(() => (comment as any)?.content ?? text ?? "", [comment, text]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(initialContent);

  useEffect(() => {
    // comment가 바뀌면 편집 텍스트 동기화
    setEditText((comment as any)?.content ?? text ?? "");
  }, [comment, text]);

  useEffect(() => {
    console.log("[CommentItem] comment:", comment);
  }, [comment]);

  const handleSave = async () => {
    const content = editText.trim();
    if (!content) return;

    try {
      await patchComment(Number((comment as any).id ?? id), { content });
      setEditing(false);
      setMenuOpen(false);
      onUpdated?.();
    } catch {
      // Alert는 훅에서 처리
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(Number((comment as any).id ?? id));
      setMenuOpen(false);
      onUpdated?.();
    } catch {
      // Alert는 훅에서 처리
    }
  };

  return (
    <>
      <View style={styles.row}>
        <UserProfile user={userDTO} size={32} showName={false} />
        <View style={{ flex: 1 }}>
          <View style={styles.headerLine}>
            <Text style={styles.user}>
              {userDTO.name} <Text style={styles.time}>{time}</Text>
            </Text>

            {isOwnComment && !editing && (
              <TouchableOpacity onPress={() => setMenuOpen((v) => !v)} hitSlop={8}>
                <Ionicons name="ellipsis-horizontal" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* 사진들 */}
          {!!comment.photos?.length && (
            <View style={styles.photoRow}>
              {comment.photos.map((uri, idx) => (
                <Image key={`photo-${idx}`} source={{ uri }} style={styles.photo} />
              ))}
            </View>
          )}

          {/* 본문: 편집/표시 */}
          {editing ? (
            <View style={styles.editBox}>
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={setEditText}
                multiline
                maxLength={500}
                placeholder="댓글 수정"
              />
              <View style={styles.editBtns}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGhost]}
                  onPress={() => {
                    setEditing(false);
                    setEditText(initialContent);
                  }}
                  disabled={loading}
                >
                  <Text style={styles.btnGhostText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={handleSave}
                  disabled={loading || !editText.trim()}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>저장</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.bodyText}>{initialContent}</Text>
          )}

          {/* 간이 메뉴 (수정/삭제) */}
          {menuOpen && !editing && (
            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
              >
                <Text style={styles.menuText}>수정</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={handleDelete} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={[styles.menuText, { color: "#FF3B30" }]}>삭제</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginVertical: 6, alignItems: "flex-start", gap: 8 },
  headerLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  user: { fontWeight: "600", fontSize: 13 },
  time: { fontSize: 11, color: "#777" },

  photoRow: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  photo: { width: 96, height: 96, borderRadius: 8, borderWidth: 1, borderColor: "#eee" },

  bodyText: { marginTop: 6, fontSize: 14, color: "#222", lineHeight: 20 },

  // 인라인 팝업 메뉴
  menu: {
    position: "absolute",
    top: -6,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 2,
    flexDirection: "row",
    overflow: "hidden",
  },
  menuItem: { paddingVertical: 8, paddingHorizontal: 12 },
  menuText: { fontSize: 13, fontWeight: "700", color: "#333" },
  menuDivider: { width: 1, backgroundColor: "#eee" },

  // 편집 UI
  editBox: {
    marginTop: 6,
    backgroundColor: "#f8f8fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 8,
  },
  editInput: {
    minHeight: 36,
    maxHeight: 120,
    fontSize: 14,
    color: "#222",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  editBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 6 },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  btnGhost: { backgroundColor: "#EEF1FF", borderWidth: 1, borderColor: "#DDE2FF" },
  btnGhostText: { color: "#6C5CE7", fontWeight: "800" },
  btnPrimary: { backgroundColor: "#6C5CE7" },
  btnPrimaryText: { color: "#fff", fontWeight: "800" },

  separator: { height: 1, backgroundColor: "#EDEDED", marginVertical: 12 },
  reviewPrompt: { fontSize: 13, color: "#666", textAlign: "center", marginBottom: 12 },
});
