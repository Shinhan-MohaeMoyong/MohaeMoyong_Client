import type { UserDTO } from '@/types/dto';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import UserProfile from '../ui/UserProfile';

type Props = {
  id: string;
  user: string | UserDTO;
  time: string;
  text: string;
  loggedUser?: UserDTO;
  isAfterPlanEnd?: boolean;
};

export default function CommentItem({ id, user, time, text, loggedUser, isAfterPlanEnd }: Props) {
  const userDto: UserDTO = typeof user === 'string' ? { id: 0, name: user, email: 'unknown@example.com', imageUrl: null } : user;
  const isOwnComment = loggedUser && userDto.id === loggedUser.id;
  
  return (
    <>
      <View style={styles.row}>
        <UserProfile user={userDto} size={32} showName={false} />
        <View style={{ flex: 1 }}>
          <Text style={styles.user}>{userDto.name} <Text style={styles.time}>{time}</Text></Text>
          <Text>{text}</Text>
        </View>
        {isOwnComment && (
          <Ionicons name="ellipsis-horizontal" size={18} color="#666" />
        )}
      </View>
      
      {isAfterPlanEnd && (
        <>
          <View style={styles.separator} />
          <Text style={styles.reviewPrompt}>일정 후기를 남겨보세요..</Text>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 6, alignItems: 'flex-start', gap: 8 },
  user: { fontWeight: '600', fontSize: 13 },
  time: { fontSize: 11, color: '#777' },
  separator: { height: 1, backgroundColor: '#EDEDED', marginVertical: 12 },
  reviewPrompt: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 12 }
});
