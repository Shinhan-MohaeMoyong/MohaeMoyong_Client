import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface TabItemProps {
  icon: string;
  label: string;
  active: boolean;
  onPress?: () => void;
}

export default function TabItem({ icon, label, active, onPress }: TabItemProps) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <Text style={[styles.iconText, active && { color: "#8C93FF" }]}>{icon}</Text>
      <Text style={[styles.tabLabel, active && { color: "#8C93FF" }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabItem: { alignItems: 'center', flex: 1 },
  tabLabel: { fontSize: 12, marginTop: 2, color: '#888' },
  iconText: { fontSize: 20, color: '#222' },
});