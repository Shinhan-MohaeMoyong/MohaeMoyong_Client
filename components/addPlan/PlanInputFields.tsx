import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  title: string;
  location: string;
  content: string;
  onTitleChange: (text: string) => void;
  onLocationChange: (text: string) => void;
  onContentChange: (text: string) => void;
};

export default function PlanInputFields({
  title,
  location,
  content,
  onTitleChange,
  onLocationChange,
  onContentChange,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>*제목</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={onTitleChange}
          placeholder="일정 제목을 입력하세요"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>*장소</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={onLocationChange}
          placeholder="장소를 입력하세요"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>*상세 내용</Text>
        <TextInput
          style={[styles.input, styles.contentInput]}
          value={content}
          onChangeText={onContentChange}
          placeholder="상세 내용을 입력하세요"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  contentInput: {
    height: 100,
    textAlignVertical: "top",
  },
});
