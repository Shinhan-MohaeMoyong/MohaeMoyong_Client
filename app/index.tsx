import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import MohaeyoungScreen from '../screens/MohaeyoungScreen';

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <MohaeyoungScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
