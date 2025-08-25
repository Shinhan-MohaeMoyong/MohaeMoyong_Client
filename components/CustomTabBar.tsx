import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// 아이콘 미리 캐싱 (로컬 PNG 이미지)
const icons = {
  index: {
    selected: require('@/assets/images/calendar_selected.png'),
    unselected: require('@/assets/images/calendar_unselected.png'),
  },
  explore: {
    selected: require('@/assets/images/profile_selected.png'),
    unselected: require('@/assets/images/profile_unselected.png'),
  },
  profile: {
    selected: require('@/assets/images/moayoung_selected.png'),
    unselected: require('@/assets/images/moayoung_unselected.png'),
  },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const handlePress = useCallback(
    (routeName: string) => {
      navigation.navigate(routeName);
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <Svg
        style={styles.svg}
        preserveAspectRatio="none"
        width={width}
        height={height/6.5}
        viewBox="0 0 200 100"
      >
        <Path d="M0 35 Q100 0 200 35 L200 100 L0 100 Z" fill="#fff" />
      </Svg>

      <View style={styles.wrapper}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const key = route.name as keyof typeof icons;
          const { options } = descriptors[route.key];
          const text = options.title;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={() => handlePress(route.name)}
              activeOpacity={0.8}
            >
              <View style={[styles.circle, isFocused && styles.circleActive]}>
                <Image
                  cachePolicy="memory-disk"
                  source={isFocused ? icons[key].selected : icons[key].unselected}
                  style={{ width: 24, height: 24 }}
                />
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {text}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default React.memo(CustomTabBar);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 10,
  },
  svg: {
    position: 'absolute',
    bottom: -12,
  },
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  tab: {
    alignItems: 'center',
  },
  circle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4
  },
  circleActive: {
    backgroundColor: '#ACB4FF',
  },
  label: {
    fontSize: 12,
    color: '#B6B6B6',
    marginTop: 3,
  },
  labelActive: {
    color: '#ffffff',
  },
});
