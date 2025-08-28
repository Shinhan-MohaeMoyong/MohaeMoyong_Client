// components/addPlan/FriendListSection.tsx
import { useFriends } from '@/hooks/useFriends';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FriendListSectionProps {
  selectedFriends: { id: number; name: string; avatar: string }[];
  onFriendToggle: (friend: { id: number; name: string; avatar: string }) => void;
}

export default function FriendListSection({ selectedFriends, onFriendToggle }: FriendListSectionProps) {
  const { data: friends, loading } = useFriends();

  const renderFriendItem = ({ item }: { item: any }) => {
    const isSelected = selectedFriends.some(selected => selected.id === item.id);
    
    return (
      <TouchableOpacity 
        style={[styles.friendRow, isSelected && styles.selectedFriendRow]}
        onPress={() => onFriendToggle(item)}
      >
        <Image 
          source={{ uri: item.avatar || "https://via.placeholder.com/40" }} 
          style={styles.avatar} 
        />
        <Text style={[styles.friendName, isSelected && styles.selectedFriendName]}>
          {item.name}
        </Text>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>친구 리스트</Text>
        <Text style={styles.loadingText}>친구 목록을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>친구 리스트</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={true}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          style={styles.list}
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
  },
  list: {
    flex: 1,
  },
  friendRow: {
    flexDirection: 'row',
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
});
