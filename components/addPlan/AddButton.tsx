import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
};

export default function AddButton({
  onPress,
  disabled = false,
  loading = false,
  title = '추가하기',
}: Props) {
  const isBlocked = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, isBlocked && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isBlocked}
      activeOpacity={0.8}
    >
      <View style={styles.contentRow}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="add" size={16} color="#fff" style={styles.icon} />
            <Text style={[styles.buttonText, isBlocked && styles.buttonTextDisabled]}>
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const PURPLE = '#8C93FF';
const PURPLE_DARK = '#6C5CE7';

const styles = StyleSheet.create({
  button: {
    backgroundColor: PURPLE,
    borderRadius: 24,
    paddingVertical: 14, // ⬆️ 높이 키움
    paddingHorizontal: 80, // ⬇️ 좌우 폭 조금 줄임
    alignSelf: "center", // ⬅️ 화면 중앙에 배치
    marginBottom: 24, // ⬆️ 아래 여백 키움
    alignItems: "center",
    justifyContent: "center",

    // 은은한 그림자
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonDisabled: {
    backgroundColor: '#C9C7E8',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 6,
  },
  icon: {
    marginRight: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,           // 🔽 작게
    fontWeight: '700',
  },
  buttonTextDisabled: {
    color: '#f0f0f0',
  },
});
