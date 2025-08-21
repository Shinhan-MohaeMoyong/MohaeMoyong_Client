import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function PostHeader() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>헬스하기</Text>
      <Text style={styles.sub}>학교 헬스장</Text>

      <View style={styles.writerRow}>
        <Image
          source={{ uri: 'https://placehold.co/32x32' }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>조현우</Text>
          <Text style={styles.time}>5시간 전 · 오늘은 등운동</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  sub: { fontSize: 13, color: '#555' },
  writerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  name: { fontWeight: '600' },
  time: { fontSize: 12, color: '#999' },
});
