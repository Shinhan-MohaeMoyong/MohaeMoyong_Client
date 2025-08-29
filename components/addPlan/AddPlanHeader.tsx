import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  isModify: boolean;
  isPublic: boolean;
  onTogglePublic: () => void;
};

export default function AddPlanHeader({ isModify, isPublic, onTogglePublic }: Props) {
  const navigation = useNavigation();
  const headerText = isModify == false ? '일정 추가하기' : '일정 수정하기';

  return (
    <View style={styles.header}>
      {/* 왼쪽: 뒤로가기 */}
      <TouchableOpacity
        style={styles.left}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* 가운데: 제목(절대 배치로 항상 중앙) */}
      <View style={styles.centerTitle} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>{headerText}</Text>
      </View>

      {/* 오른쪽: 공개/비공개 토글 */}
      <TouchableOpacity
        style={styles.right}
        onPress={onTogglePublic}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.publicText}>{isPublic ? '공개' : '비공개'}</Text>
        <View style={[styles.toggleSwitch, isPublic && styles.toggleSwitchActive]}>
          <View style={[styles.toggleKnob, isPublic && styles.toggleKnobActive]} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'relative',            // 중앙 제목 절대배치용
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // 좌우 배치
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },

  // 좌/우 영역
  left: {
    minWidth: 40,                    // 좌측 영역 최소폭 확보(제목 겹침 방지)
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 96,                    // 우측 영역 최소폭 확보(텍스트 길이 변화 대비)
    justifyContent: 'flex-end',
  },

  // 중앙 제목: 항상 화면 가운데
  centerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  publicText: {
    fontSize: 14,
    color: '#666',
    minWidth: 40,                    // '공개'/'비공개' 길이 차이로 인한 흔들림 완화
    textAlign: 'right',
  },

  // 토글 스위치 + 노브
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ddd',         // OFF
    position: 'relative',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#FF6B9D',      // ON
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 2,
    left: 2,                         // OFF 위치
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    left: 22,                        // ON 위치
  },
});
