import { useCallback, useMemo, useState } from "react";
import { PROFILE_IMAGE_SIZE, PROFILE_RING_PADDING } from "../constants/layout";
import type { UserDTO } from "../types/dto/UserDTO";

type UseUserProfileParams = {
  user: UserDTO;
  size?: number;                // 옵션: 원형 아바타 지름(px), 기본 72
  onPress?: (user: UserDTO) => void;
  enableNavigation?: boolean;   // 네비게이션 활성화 여부
  setCurrentUserTo?: (user: UserDTO) => void; // currentUser 설정 함수
};

export function useUserProfile({ user, size = PROFILE_IMAGE_SIZE, onPress, enableNavigation = false, setCurrentUserTo }: UseUserProfileParams) {
  const [loading, setLoading] = useState(true);

  // 이미지 사이즈/스타일 계산
  const ringSize = size + PROFILE_RING_PADDING; // 테두리 png가 바깥으로 4px씩
  const imageSize = size;

  console.log('imageSize:', imageSize);

  const source = useMemo(() => {
    if (user.imageUrl && user.imageUrl.trim().length > 0) {
      return { uri: user.imageUrl };
    }
    // 기본 이미지(placeholder) — 필요하면 프로젝트에 추가해서 교체
    return require("../assets/images/profile_default.png");
  }, [user.imageUrl]);

  const handleLoadEnd = useCallback(() => setLoading(false), []);
  
  const handlePress = useCallback(() => {
    // 커스텀 onPress가 있으면 먼저 실행
    onPress?.(user);
    
    // currentUser를 클릭한 사용자로 설정
    setCurrentUserTo?.(user);
    console.log('setCurrentUserTo:', user);
    
    // 네비게이션이 활성화되어 있으면 MohaeyoungScreen으로 이동
    if (enableNavigation) {
      console.log("Navigating to MohaeyoungScreen with user:", user.name);
      // 스택을 리셋하고 MohaeyoungScreen으로 이동
      //router.replace("/");
    }
  }, [onPress, user, enableNavigation, setCurrentUserTo]);

  return {
    state: { loading, ringSize, imageSize },
    data: { user, source },
    actions: { handleLoadEnd, handlePress },
  };
}
