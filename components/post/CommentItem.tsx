import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function CommentItem({ user, time, text }: any) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: 'https://placehold.co/32x32' }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.user}>{user} <Text style={styles.time}>{time}</Text></Text>
        <Text>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  user: { fontWeight: '600' },
  time: { fontSize: 12, color: '#777' }
});
