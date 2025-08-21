import type { UserDTO } from '@/types/dto';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import UserProfile from '../ui/UserProfile';

type Props = {
  user: string | UserDTO;
  time: string;
  text: string;
};

export default function CommentItem({ user, time, text }: Props) {
  const userDto: UserDTO = typeof user === 'string' ? { id: 0, name: user, email: 'unknown@example.com', imageUrl: null } : user;
  return (
    <View style={styles.row}>
      <UserProfile user={userDto} size={32} showName={false} />
      <View style={{ flex: 1 }}>
        <Text style={styles.user}>{userDto.name} <Text style={styles.time}>{time}</Text></Text>
        <Text>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 10, alignItems: 'flex-start', gap: 10 },
  user: { fontWeight: '600' },
  time: { fontSize: 12, color: '#777' }
});
