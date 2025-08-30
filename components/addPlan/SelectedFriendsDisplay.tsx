// components/addPlan/SelectedFriendsDisplay.tsx
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectedFriendsDisplayProps {
  selectedFriends: { id: number; name: string; avatar: string }[];
  onEditPress: () => void;
}

export default function SelectedFriendsDisplay({ 
  selectedFriends, 
  onEditPress 
}: SelectedFriendsDisplayProps) {
  if (selectedFriends.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>*참여자</Text>
        <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
          <Text style={styles.editButtonText}>편집</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.friendsContainer}>
        {selectedFriends.map((friend, index) => (
          <View key={friend.id} style={styles.friendItem}>
            <Image 
              source={{ uri: friend.avatar || "https://via.placeholder.com/32" }} 
              style={styles.avatar} 
            />
            <Text style={styles.friendName}>{friend.name}</Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.countText}>
        총 {selectedFriends.length}명이 참여합니다
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#8C93FF',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  friendsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  friendName: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  countText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});
