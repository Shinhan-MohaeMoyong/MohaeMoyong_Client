import { SERVER_URL } from '@/constants/server';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LoginScreen2Props {
  onLoginSuccess?: (token: string) => void;
}

const redirectUri = 'test://index';

export default function LoginScreen2({ onLoginSuccess }: LoginScreen2Props) {
  const subRef = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 토큰 추출 함수
  const extractToken = useCallback((url: string) => {
    console.log('토큰 추출 시도:', url);
    
    try {
      // url 예: test://index?token=eyJhbGciOi...
      const parsed = Linking.parse(url);
      console.log('parsed URL:', parsed);
      
      // query나 hash 둘다 대비
      const qp = parsed.queryParams ?? {};
      const t =
        (qp.token as string | undefined) ||
        new URL(url).searchParams.get('token') ||
        new URL(url).hash.replace(/^#/, '').split('&').find(s => s.startsWith('access_token='))?.split('=')[1] ||
        null;

      if (t) {
        console.log('토큰 추출 성공:', t);
        setIsLoading(false);
        // 경고창에 토큰 표시
        Alert.alert(
          '로그인 성공!',
          `토큰: ${t}`,
          [
            {
              text: '확인',
              onPress: () => {
                // 로그인 성공 콜백 호출
                if (onLoginSuccess) {
                  onLoginSuccess(t);
                }
              }
            }
          ]
        );
        return true;
      }
    } catch (error) {
      console.error('토큰 추출 에러:', error);
    }
    return false;
  }, [onLoginSuccess]);

  // iOS에서 SFAuthenticationSession 종료 처리를 위해 권장
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  // 앱 시작 시 초기 URL 체크
  useEffect(() => {
    const checkInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL) {
          console.log('초기 URL 발견:', initialURL);
          extractToken(initialURL);
        }
      } catch (error) {
        console.error('초기 URL 체크 에러:', error);
      }
    };
    
    checkInitialURL();
  }, [extractToken]);

  useEffect(() => {
    // 앱으로 돌아온 URL 수신
    const onUrl = ({ url }: { url: string }) => {
      console.log('리다이렉트 URL 수신:', url);
      extractToken(url);
    };

    const sub = Linking.addEventListener('url', onUrl);
    subRef.current = () => sub.remove();
    
    return () => {
      if (subRef.current) {
        subRef.current();
      }
    };
  }, [extractToken]);

  const handleLogin = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const authUrl = `${SERVER_URL}/oauth2/authorization/kakao?redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;

    console.log('카카오 로그인 시작, authUrl:', authUrl);

    try {
      // 더 안전한 방식으로 시도
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl, 
        redirectUri,
        {
          showInRecents: true,
          createTask: false,
        }
      );
      
      console.log('WebBrowser 결과:', result);
      
      if (result.type === 'success') {
        console.log('WebBrowser 성공');
        // result.url에서 직접 토큰 추출
        if (result.url) {
          console.log('WebBrowser result.url:', result.url);
          extractToken(result.url);
        }
      } else if (result.type === 'cancel') {
        console.log('사용자가 로그인을 취소했습니다.');
        setIsLoading(false);
      } else if (result.type === 'dismiss') {
        console.log('WebBrowser가 닫혔습니다.');
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('WebBrowser 에러:', error);
      setIsLoading(false);
      
      // 에러 타입별로 다른 처리
      if (error instanceof Error) {
        if (error.message.includes('WebAuthenticationSession')) {
          Alert.alert(
            '로그인 오류', 
            '인증 세션을 시작할 수 없습니다. 다시 시도해주세요.',
            [{ text: '확인' }]
          );
        } else {
          Alert.alert('오류', '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      } else {
        Alert.alert('오류', '알 수 없는 오류가 발생했습니다.');
      }
    }
  }, [isLoading, extractToken]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>뭐해모여</Text>
        <Text style={styles.subtitle}>카카오톡으로 간편하게 로그인하세요</Text>
        
        <TouchableOpacity 
          style={[styles.kakaoButton, isLoading && styles.kakaoButtonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.kakaoButtonText}>
            {isLoading ? '로그인 중...' : '카카오톡으로 로그인하기'}
          </Text>
        </TouchableOpacity>
        
        {isLoading && (
          <Text style={styles.loadingText}>
            카카오 로그인 페이지가 열리고 있습니다...
          </Text>
        )}
      </View>
    </View>
  );
}

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
  kakaoButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.7,
  },
  kakaoButtonText: {
    color: '#3C1E1E',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
