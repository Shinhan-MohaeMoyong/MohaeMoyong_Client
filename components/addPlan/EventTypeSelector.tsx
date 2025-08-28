import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  selectedType: 'group' | 'personal';
  onSelectType: (type: 'group' | 'personal') => void;
};

export default function EventTypeSelector({ selectedType, onSelectType }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>*유형</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'group' && styles.typeButtonActive
          ]}
          activeOpacity={0.8}
          onPress={() => onSelectType('group')}
        >
          <Text
            style={[
              styles.typeButtonText,
              selectedType === 'group' && styles.typeButtonTextActive
            ]}
          >
            단체 일정
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'personal' && styles.typeButtonActive
          ]}
          activeOpacity={0.8}
          onPress={() => onSelectType('personal')}
        >
          <Text
            style={[
              styles.typeButtonText,
              selectedType === 'personal' && styles.typeButtonTextActive
            ]}
          >
            개인 일정
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = '#6C5CE7';

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    height: 40,                 // 🔽 크기 줄임
    borderRadius: 20,           // pill 형태 유지
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,           // 테두리 얇게
    borderColor: PURPLE,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  typeButtonActive: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  typeButtonText: {
    fontSize: 14,               // 🔽 글자 크기 줄임
    fontWeight: '600',
    color: PURPLE,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
});
