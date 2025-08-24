import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SERVER_URL } from '../constants/server';
import { useUser } from '../contexts/UserContext';
import { UserEntity } from '../types/entity/UserEntity';

interface LoginScreenProps {
  onLoginSuccess?: (token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login } = useUser();

  const handleKakaoLogin = async () => {
    try {
      const url = `${SERVER_URL}/oauth2/authorization/kakao`;
      console.log('카카오 로그인 URL:', url);
      
      const result = await WebBrowser.openAuthSessionAsync(url, 'mohaemoyong://');
      
      if (result.type === 'success') {
        console.log('카카오 로그인 성공:', result.url);
        
        // URL에서 토큰 파라미터 추출
        if (result.url) {
          const urlParams = new URL(result.url);
          const token = urlParams.searchParams.get('token') || urlParams.searchParams.get('access_token');
          
          if (token) {
            // 임시 사용자 정보 생성 (실제로는 서버에서 받아야 함)
            const tempUser: UserEntity = {
              userId: 1,
              username: '카카오 사용자',
              userkey: 'kakao_user',
              email: 'kakao@example.com',
              imageUrl: 'https://example.com/profile.jpg',
            };
            
            // UserContext에 로그인 정보 저장
            login(tempUser, token);
            
            Alert.alert('로그인 성공', `토큰: ${token}`);
            console.log('받은 토큰:', token);
            
            // 로그인 성공 콜백 호출
            if (onLoginSuccess) {
              onLoginSuccess(token);
            }
          } else {
            Alert.alert('로그인 실패', '토큰을 받지 못했습니다.');
          }
        }
      } else if (result.type === 'cancel') {
        console.log('사용자가 로그인을 취소했습니다.');
      } else {
        console.log('웹브라우저 결과:', result);
      }
    } catch (error) {
      console.error('카카오 로그인 에러:', error);
      Alert.alert('로그인 에러', '로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>뭐해모여</Text>
        <Text style={styles.subtitle}>카카오톡으로 간편하게 로그인하세요</Text>
        
        <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
          <Text style={styles.kakaoButtonText}>카카오톡으로 로그인하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  webview: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 24,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kakaoButtonText: {
    color: '#3C1E1E',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LoginScreen;
