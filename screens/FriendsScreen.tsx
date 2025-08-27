import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import FriendRow from "@/components/friends/FriendRow";
import HeaderBar from "@/components/ui/HeaderBar";
import NoticeModal from "@/components/ui/NoticeModal";
import SearchBox from "@/components/ui/SearchBox";
import { RowItem, useFriends } from "@/hooks/useFriends";

export default function FriendsScreen() {
  const router = useRouter();
  const {
    tab,
    setTab,
    query,
    setQuery,
    data,
    primaryLabel,
    setSearchActive,
    sendFriendRequest,
    cancelFriendRequest,
    deleteFriend,
  } = useFriends();

  // 메시지 입력 모달
  const [msgModalVisible, setMsgModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<RowItem | null>(null);

  // 알림 모달(커스텀)
  const [notice, setNotice] = useState<{
    visible: boolean;
    title?: string;
    message?: string;
    onOk?: () => void;
  }>({ visible: false });
  const showNotice = (title: string, message: string, onOk?: () => void) =>
    setNotice({ visible: true, title, message, onOk });
  const closeNotice = () => setNotice((n) => ({ ...n, visible: false }));

  // 탭 인디케이터
  const indicator = useRef(new Animated.Value(0)).current; // 0=friends, 1=requests
  useEffect(() => {
    Animated.timing(indicator, {
      toValue: tab === "friends" ? 0 : 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [tab, indicator]);

  const indicatorStyle = {
    left: indicator.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "50%"],
    }),
  };

  const activeCount = data?.length ?? 0;

  // 기본 액션
  const onPrimary = (item: RowItem) => {
    if (item.requestId) {
      // 요청 취소
      cancelFriendRequest(item.requestId)
        .then(() => {
          showNotice("요청 취소", "요청이 취소되었습니다.", () => setTab("requests"));
        })
        .catch((err) => {
          console.warn("취소 API 에러:", err);
          showNotice("요청 취소", "요청이 취소되었습니다. (응답 오류 무시)", () =>
            setTab("requests")
          );
        });
      return;
    }

    if (primaryLabel === "요청 보내기") {
      setTarget(item);
      setMsgModalVisible(true);
      console.log("요청보내기");
      return;
    }

    // 친구 삭제
    deleteFriend(item.id)
      .then(() => {
        showNotice("친구 삭제", "친구가 삭제되었습니다.", () => setTab("friends"));
      })
      .catch(() => {
        showNotice("친구 삭제 실패", "삭제 중 오류가 발생했습니다. (DB는 반영됐을 수 있음)", () =>
          setTab("friends")
        );
      });
  };

  // 실제 요청 보내기
  const confirmRequest = async () => {
    if (!target) return;
    try {
      const res = await sendFriendRequest(target.id, message);
      console.log("✅ 친구 요청 성공:", res);
      showNotice("친구 요청", `"${target.name}"님께 친구 요청을 보냈습니다.`, () =>
        setTab("requests")
      );
    } catch (err) {
      console.error("❌ 친구 요청 실패:", err);
      showNotice("친구 요청 실패", "친구 요청 중 오류가 발생했습니다.");
    } finally {
      setMsgModalVisible(false);
      setMessage("");
      setTarget(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <HeaderBar
        title="친구 요청"
        right={
          <TouchableOpacity onPress={() => router.push("/friends/accept")}>
            <Ionicons name="person-add-outline" size={24} color="black" />
          </TouchableOpacity>
        }
      />

      <SearchBox
        value={query}
        onChangeText={setQuery}
        onFocus={() => setSearchActive(true)}
        onBlur={() => setSearchActive(false)}
      />

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <View style={styles.tabsRow}>
          <TouchableOpacity style={styles.tabBtn} onPress={() => setTab("friends")}>
            <Text style={[styles.tabText, tab === "friends" && styles.tabTextActive]}>친구</Text>
            {tab === "friends" && (
              <View style={[styles.badge, styles.badgeActive]}>
                <Text style={[styles.badgeText, styles.badgeTextActive]}>{activeCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabBtn} onPress={() => setTab("requests")}>
            <Text style={[styles.tabText, tab === "requests" && styles.tabTextActive]}>
              친구 요청
            </Text>
            {tab === "requests" && (
              <View style={[styles.badge, styles.badgeActive]}>
                <Text style={[styles.badgeText, styles.badgeTextActive]}>{activeCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.indicatorTrack}>
          <Animated.View style={[styles.indicatorBar, indicatorStyle]} />
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.requestId ?? item.id)}
        renderItem={({ item }) => (
          <FriendRow
            tab={tab}
            friend={item}
            primaryLabel={item.requestId ? "요청 취소" : primaryLabel}
            onPrimary={() => onPrimary(item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.listContent,
          (!data || data.length === 0) && styles.listContentEmptyGrow,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🫧</Text>
            <Text style={styles.emptyTitle}>표시할 데이터가 없어요</Text>
            <Text style={styles.emptyDesc}>
              상단 검색에서 친구를 찾아 요청을 보내거나, 받은 요청을 확인해보세요.
            </Text>
          </View>
        }
      />

      {/* 메시지 입력 모달 */}
      <Modal visible={msgModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{target?.name}님께 보낼 메시지</Text>
            </View>

            {/* 입력 */}
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="메시지를 입력하세요"
              placeholderTextColor="#9CA3AF"
              style={styles.modalInput}
              multiline
              maxLength={120}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{message.length}/120</Text>

            {/* 액션 버튼 */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.btn, styles.btnGhost]}
                onPress={() => setMsgModalVisible(false)}
              >
                <Text style={[styles.btnText, styles.btnGhostText]}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, !message.trim() && styles.btnDisabled]}
                onPress={message.trim() ? confirmRequest : undefined}
                disabled={!message.trim()}
              >
                <Text style={[styles.btnText, styles.btnPrimaryText]}>보내기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 알림 모달 */}
      <NoticeModal
        visible={notice.visible}
        title={notice.title}
        message={notice.message}
        onClose={closeNotice}
        onOk={notice.onOk}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Tabs
  tabsWrap: {
    paddingHorizontal: 20,
    marginTop: 12,
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#111827",
  },
  badge: {
    minWidth: 22,
    paddingHorizontal: 6,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: {
    backgroundColor: "#8C93FF22",
  },
  badgeText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  badgeTextActive: {
    color: "#8C93FF",
  },

  // Indicator
  indicatorTrack: {
    height: 2,
    width: "100%",
    backgroundColor: "#E5E7EB",
    marginTop: 10,
    position: "relative",
  },
  indicatorBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "50%",
    height: 2,
    backgroundColor: "#8C93FF",
  },

  // 메시지 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.30)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    width: "84%",
    // 살짝 그림자
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    minHeight: 90,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },
  charCount: {
    alignSelf: "flex-end",
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
  },

  modalFooter: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 15,
    fontWeight: "700",
  },
  btnGhost: {
    backgroundColor: "#F3F4F6",
  },
  btnGhostText: {
    color: "#374151",
  },
  btnPrimary: {
    backgroundColor: "#8C93FF",
  },
  btnPrimaryText: {
    color: "#fff",
  },
  btnDisabled: {
    opacity: 0.45,
  },
  separator: {
    height: 1,
    backgroundColor: "#F0F1F5",
    marginLeft: 72, // 아바타 영역만큼 띄워서 라인 시작
  },

  // 리스트 전체 패딩
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  listContentEmptyGrow: {
    flexGrow: 1,
    justifyContent: "center",
  },

  // 빈 상태 영역
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // 화면 중앙 정렬
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
