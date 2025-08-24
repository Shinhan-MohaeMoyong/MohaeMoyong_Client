import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SERVER_URL, TOKEN, updateToken } from '../constants/server';
import { useUser } from '../contexts/UserContext';
import { UserEntity } from '../types/entity/UserEntity';
import LoginScreen from './LoginScreen';

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [loadingText, setLoadingText] = useState('앱을 시작하는 중...');
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { login } = useUser();
  const didInit = React.useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (!showLogin && !isInitialized) {
      initializeApp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const initializeApp = async () => {
    try {
      setLoadingText('사용자 정보를 확인하는 중...');
      
      // constants에 있는 토큰으로 사용자 정보 요청
      const response = await fetch(`${SERVER_URL}/user/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData: UserEntity = await response.json();
        console.log('사용자 정보 받음:', userData);
        
        setLoadingText('로그인 완료!');
        
        // 전역 상태에 사용자 정보와 토큰 설정
        console.log('initializeApp login 호출');
        login(userData, TOKEN);
        
        // 초기화 완료 표시
        setIsInitialized(true);
        
        // 잠시 후 로딩 완료 콜백 호출
        setTimeout(() => {
          if (onLoadingComplete) {
            onLoadingComplete();
          }
        }, 1000);
        
      } else {
        console.error('사용자 정보 요청 실패:', response.status, response.statusText);
        setError('사용자 정보를 가져올 수 없습니다.');
        // 로그인 화면 표시
        setShowLogin(true);
      }
      
    } catch (error) {
      console.error('앱 초기화 에러:', error);
      setError('네트워크 오류가 발생했습니다.');
      // 로그인 화면 표시
      setShowLogin(true);
    }
  };

  const handleLoginSuccess = (token: string) => {
    console.log('로그인 성공, 토큰 갱신:', token);
    // 토큰을 constants/server.ts에 갱신
    updateToken(token);
    setShowLogin(false);
    setError(null);
    
    // 로그인 성공 후 바로 로딩 완료 콜백 호출 (initializeApp 재호출 제거)
    setTimeout(() => {
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 1000);
  };

  // 로그인 화면 표시
  if (showLogin) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 초기화가 완료되면 로딩스크린 숨김
  if (isInitialized) {
    return null;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>오류 발생</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <Text style={styles.retryText}>로그인 화면으로 이동합니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>뭐해모여</Text>
        <ActivityIndicator size="large" color="#6C5CE7" style={styles.spinner} />
        <Text style={styles.loadingText}>{loadingText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 60,
  },
  spinner: {
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 20,
  },
  errorDetail: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  retryText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default LoadingScreen;
