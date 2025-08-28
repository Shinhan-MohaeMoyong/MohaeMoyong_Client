// components/addPlan/FriendListSection.tsx
import { SERVER_URL } from '@/constants/server';
import { getToken } from '@/contexts/tokenManager';
import { toUserDTO } from '@/mappers/userMapper';
import { FriendEntity } from '@/types';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import UserProfile from '../ui/UserProfile';

interface FriendListSectionProps {
  selectedFriends: { id: number; name: string; avatar: string }[];
  onFriendToggle: (friend: { id: number; name: string; avatar: string }) => void;
  onEditPress: () => void;
}

export default function FriendListSection({ selectedFriends, onFriendToggle, onEditPress }: FriendListSectionProps) {
  const [friends, setFriends] = useState<FriendEntity[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/v1/friends`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${await getToken()}`,
          },
        });
        const data = await response.json();
        setFriends(data);
        setLoading(false);
      } catch (e) {
        console.log(e);
      }
    };
    loadFriends();
  }, []);

  const renderFriendItem = ({ item }: { item: any }) => {
    const isSelected = selectedFriends.some(selected => selected.id === item.id);
    toUserDTO(item)
    if(!isSelected) return null;
    return (
      <UserProfile
        user={toUserDTO(item)}
        size={46}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>함께 참여하는 친구</Text>
        <Text style={styles.loadingText}>친구 목록을 불러오는 중...</Text>
      </View>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>친구 리스트</Text>
        <Text style={styles.loadingText}>친구가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* 왼쪽 */}
        <Text style={styles.label}>함께 참여하는 친구</Text>

        {/* 오른쪽 묶음 */}
        <View style={styles.rightGroup}>
          {selectedFriends.length > 0 && (
            <Text style={styles.selectedCount}>
              {selectedFriends.length}명 선택됨
            </Text>
          )}
          <TouchableOpacity
            style={styles.editButtonContainer}
            onPress={onEditPress}
          >
            <Text style={styles.editText}>✏️ 수정</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.list}
          nestedScrollEnabled={true}
        
        />
      </View>
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
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedCount: {
    fontSize: 14,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
    padding: 10,
  },
  list: {
    height: 80,
  },
  friendRow: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    
  },
  selectedFriendRow: {
    backgroundColor: '#f0f9ff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  friendName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  selectedFriendName: {
    color: '#1e40af',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginLeft: 72,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#6b7280',
    fontSize: 16,
  },
  editButtonContainer: {
    backgroundColor: '#6C5CE7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginHorizontal: 10,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
