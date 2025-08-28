import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
}

export default function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Text style={styles.iconText}>{icon}</Text>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Text style={styles.iconText}>{'>'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { marginLeft: 12, fontSize: 16, color: '#222' },
  iconText: { fontSize: 20, color: '#222' },
});