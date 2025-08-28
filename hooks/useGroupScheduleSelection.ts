// hooks/useGroupScheduleSelection.ts
import { RowItem } from "@/hooks/useFriends";
import { useState } from "react";

export function useGroupScheduleSelection() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<RowItem[]>([]);

  const openSelection = () => {
    setIsVisible(true);
  };

  const closeSelection = () => {
    setIsVisible(false);
  };

  const handleConfirm = (friends: RowItem[]) => {
    setSelectedFriends(friends);
    setIsVisible(false);
    // 여기서 선택된 친구들로 원하는 작업을 수행할 수 있습니다
    console.log("선택된 친구들:", friends.map(f => f.name));
  };

  const clearSelection = () => {
    setSelectedFriends([]);
  };

  return {
    isVisible,
    selectedFriends,
    openSelection,
    closeSelection,
    handleConfirm,
    clearSelection,
  };
}
