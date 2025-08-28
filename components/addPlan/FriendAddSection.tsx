// components/addPlan/FriendAddSection.tsx
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FriendAddSectionProps {
  onAddFriends: () => void;
}

export default function FriendAddSection({ onAddFriends }: FriendAddSectionProps) {
  const friendCategories = [
    { id: 1, name: 'Friends', image: 'https://via.placeholder.com/60/FF6B6B/FFFFFF?text=F' },
    { id: 2, name: 'Sport', image: 'https://via.placeholder.com/60/4ECDC4/FFFFFF?text=S' },
    { id: 3, name: 'Design', image: 'https://via.placeholder.com/60/45B7D1/FFFFFF?text=D' },
    { id: 4, name: 'New', image: 'https://via.placeholder.com/60/96CEB4/FFFFFF?text=+' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>친구 추가</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {friendCategories.map((category) => (
          <TouchableOpacity 
            key={category.id} 
            style={styles.categoryItem}
            onPress={onAddFriends}
          >
            <Image 
              source={{ uri: category.image }} 
              style={styles.categoryImage} 
            />
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  scrollContainer: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
});
