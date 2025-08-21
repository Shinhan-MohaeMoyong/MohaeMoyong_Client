import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function CommentInput() {
  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholder="댓글 작성"
        style={styles.input}
      />
      <TouchableOpacity style={styles.btn}>
        <Ionicons name="send" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

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
