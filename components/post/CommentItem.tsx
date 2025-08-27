import { useUser } from "@/contexts/UserContext";
import type { UserDTO } from "@/types/dto";
import type { CommentDTO } from "@/types/dto/CommentDTO";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import UserProfile from "../ui/UserProfile";

type Props = {
  id: string;
  userDTO: UserDTO;
  comment: CommentDTO;
  time: string;
  text: string;
  isAfterPlanEnd?: boolean;
};

export default function CommentItem({ id, userDTO, comment, time, text, isAfterPlanEnd }: Props) {
  const { loggedUser } = useUser();
  const isOwnComment = loggedUser && userDTO.id === loggedUser.userId;

  useEffect(() => {
    console.log("[in CommentItem] comment : ", comment);
  }, [comment]);

  return (
    <>
      <View style={styles.row}>
        <UserProfile user={userDTO} size={32} showName={false} />
        <View style={{ flex: 1 }}>
          <Text style={styles.user}>
            {userDTO.name} <Text style={styles.time}>{time}</Text>
          </Text>
          {comment.photos &&
            comment.photos.length > 0 &&
            comment.photos.map((photo) => (
              <Image source={{ uri: photo }} style={{ width: 100, height: 100 }} />
            ))}
          <Text>{text}</Text>
        </View>
        {isOwnComment && <Ionicons name="ellipsis-horizontal" size={18} color="#666" />}
      </View>

      {isAfterPlanEnd && (
        <>
          <View style={styles.separator} />
          <Text style={styles.reviewPrompt}>일정 후기를 남겨보세요..</Text>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", marginVertical: 6, alignItems: "flex-start", gap: 8 },
  user: { fontWeight: "600", fontSize: 13 },
  time: { fontSize: 11, color: "#777" },
  separator: { height: 1, backgroundColor: "#EDEDED", marginVertical: 12 },
  reviewPrompt: { fontSize: 13, color: "#666", textAlign: "center", marginBottom: 12 },
});
