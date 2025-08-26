import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type TopTabKey = "일정" | "계좌" | "저축";

interface TopTabsProps {
  active: TopTabKey;
  onChange: (tab: TopTabKey) => void;
  style?: any;
}

export default function TopTabs({ active, onChange, style }: TopTabsProps) {
  const tabs: TopTabKey[] = ["일정", "계좌", "저축"];

  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, active === tab && styles.activeTab]}
          onPress={() => onChange(tab)}
        >
          <Text style={[styles.tabText, active === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600',
  },
});
