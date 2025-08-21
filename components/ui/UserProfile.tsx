import { useUserProfile } from "@/hooks/useUserProfile";
import React, { memo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import type { UserDTO } from "../../types/dto/UserDTO";

type Props = {
  user: UserDTO;
  size?: number;                     // 원형 프로필 크기
  showName?: boolean;                // 이름 표시 여부
  containerStyle?: ViewStyle;        // 외부 컨테이너 커스텀
  onPress?: (user: UserDTO) => void; // 클릭 콜백
  enableNavigation?: boolean;        // 네비게이션 활성화 여부
  setCurrentUserTo?: (user: UserDTO) => void; // currentUser 설정 함수
};

const RING = require("../../assets/images/profile_ring.png"); // isNew=true일 때 표시될 테두리 png

function UserProfileView({ user, size, showName = true, containerStyle, onPress, enableNavigation, setCurrentUserTo }: Props) {
  const {
    state: { loading, ringSize, imageSize },
    data: { source },
    actions: { handleLoadEnd, handlePress },
  } = useUserProfile({ user, size, onPress, enableNavigation, setCurrentUserTo });

  return (
    <Pressable style={[styles.container, containerStyle]} onPress={handlePress} accessibilityRole="button">
      <View style={{ width: ringSize, height: ringSize }}>
        {/* 테두리 (새 소식일 때만) */}
        {user.isNew && (
          <Image
            source={RING}
            style={[styles.ring, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}
            resizeMode="cover"
          />
        )}

        {/* 프로필 이미지 */}
        <Image
          source={source}
          onLoadEnd={handleLoadEnd}
          resizeMode="cover"
          style={[
            styles.image,
            {
              width: imageSize,
              height: imageSize,
              borderRadius: imageSize / 2,
              // ring 중앙에 오도록 살짝 안쪽으로 배치
              position: "absolute",
              top: (ringSize - imageSize) / 2,
              left: (ringSize - imageSize) / 2,
            },
          ]}
        />

        {/* 로딩 인디케이터(선택) */}
        {loading && (
          <View
            pointerEvents="none"
            style={[
              styles.loadingOverlay,
              { width: imageSize, height: imageSize, borderRadius: imageSize / 2, top: (ringSize - imageSize) / 2, left: (ringSize - imageSize) / 2 },
            ]}
          >
            <ActivityIndicator />
          </View>
        )}
      </View>

      {showName && (
        <Text style={styles.name} numberOfLines={1}>
          {user.name}
        </Text>
      )}
    </Pressable>
  );
}

export default memo(UserProfileView);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  ring: {
    position: "absolute",
  },
  image: {
    backgroundColor: "#f1f1f1",
  },
  loadingOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  name: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "500",
    color: "#ff0000"
  },
});
