import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  onFocusExpand?: () => void;
};

const CommentInput: React.FC<Props> = ({ onFocusExpand }) => {
  return (
    <View style={styles.wrapper}>
      <BottomSheetTextInput
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
