import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { UserEntity } from '../../types/entity/UserEntity';

export const LoginStatus: React.FC = () => {
  const { loggedUser, login, logout, isLoggedIn, token } = useUser();

  const handleLogin = () => {
    // 예시 사용자 데이터로 로그인
    const mockUser: UserEntity = {
      userId: 1,
      username: '테스트사용자',
      userkey: 'test123',
      email: 'test@example.com',
      imageUrl: 'https://example.com/profile.jpg',
    };
    const mockToken = 'mock_token_12345';
    login(mockUser, mockToken);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>안녕하세요, {loggedUser?.username}님!</Text>
          <Text style={styles.userDetail}>이메일: {loggedUser?.email}</Text>
          <Text style={styles.tokenInfo}>토큰: {token?.substring(0, 20)}...</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>로그인이 필요합니다</Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>테스트 로그인</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  userInfo: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  userDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tokenInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
    fontFamily: 'monospace',
  },
  loginSection: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
