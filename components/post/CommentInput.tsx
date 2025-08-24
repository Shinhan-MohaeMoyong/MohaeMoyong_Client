import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

type Props = {
  onFocusExpand?: () => void;
};

const CommentInput: React.FC<Props> = ({ onFocusExpand }) => {
  const { loggedUser } = useUser();
  const BSInput = Platform.OS === 'web' ? TextInput : BottomSheetTextInput;


  return (
    <View style={styles.wrapper}>
      <BSInput
        placeholder="댓글 작성"
        style={styles.input}
        onFocus={onFocusExpand}
      />
      <TouchableOpacity style={styles.btn}>
        <Ionicons name="send" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default CommentInput;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userInfo: {
    marginRight: 8,
  },
  username: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
  },
  btn: {
    backgroundColor: '#6C5CE7',
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
