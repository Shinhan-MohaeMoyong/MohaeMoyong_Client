// src/components/FriendsList.tsx
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import type { UserDTO } from "../types/dto/UserDTO";
import UserProfile from "./ui/UserProfile";

type Props = {
  friends: UserDTO[];
  loading?: boolean;
  errorText?: string | null;
  onRefresh?: () => void;
  onItemPress?: (u: UserDTO) => void;
  numColumns?: number;
  setCurrentUserTo?: (user: UserDTO) => void;
};

export default function FriendsList({
  friends,
  loading = false,
  errorText = null,
  onRefresh,
  onItemPress,
  numColumns = 4,
  setCurrentUserTo,
}: Props) {
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (errorText) {
    return (
      <View style={{ padding: 16 }}>
        <Text>불러오기 실패: {errorText}</Text>
      </View>
    );
    }
    
    console.log('friends:', friends);

  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => String(item.id)}
      style={{ height: 120 }}
      contentContainerStyle={{ padding: 16 }}
      numColumns={numColumns}
      columnWrapperStyle={{ gap: 16 }}
      renderItem={({ item }) => (
        <UserProfile
          user={item}
          showName
          onPress={onItemPress}
          containerStyle={{ marginRight: 16 }}
          enableNavigation={true}
          setCurrentUserTo={setCurrentUserTo}
        />
      )}
      refreshing={loading}
      onRefresh={onRefresh}
    />
  );
}
