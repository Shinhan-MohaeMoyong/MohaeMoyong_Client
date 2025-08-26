import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EventBlockProps {
  title: string;
  time: string;
  location?: string;
  onPress?: () => void;
}

export default function EventBlock({ title, time, location, onPress }: EventBlockProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{time}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
        {location && (
          <Text style={styles.locationText} numberOfLines={1}>
            📍 {location}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A78BFA',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
