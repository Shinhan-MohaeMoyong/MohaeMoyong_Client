import React, { useRef, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SERVER_URL } from '../constants/server';
import { useUser } from '../contexts/UserContext';
import { UserEntity } from '../types/entity/UserEntity';

interface LoginScreenProps {
  onLoginSuccess?: (token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { login } = useUser();
  const [showWebView, setShowWebView] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleKakaoLogin = () => {
    // 로그인 상태 초기화
    setIsLoggedIn(false);
    setShowWebView(true);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView에서 받은 데이터:', data);
      
      if ((data.token || data.access_token) && !isLoggedIn) {
        const token = data.token || data.access_token;
        
        // 중복 로그인 방지
        setIsLoggedIn(true);
        
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
        
        // WebView 닫기
        setShowWebView(false);
        
        // 로그인 성공 콜백 호출
        if (onLoginSuccess) {
          onLoginSuccess(token);
        }
      }
    } catch (error) {
      console.error('WebView 메시지 파싱 에러:', error);
    }
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    console.log('WebView 네비게이션 상태:', navState);
    
    // 특정 URL 패턴을 감지하여 토큰 추출
    if (navState.url && (navState.url.includes('token=') || navState.url.includes('access_token=')) && !isLoggedIn) {
      const urlParams = new URL(navState.url);
      const token = urlParams.searchParams.get('token') || urlParams.searchParams.get('access_token');
      
      if (token) {
        // 중복 로그인 방지
        setIsLoggedIn(true);
        
        // 임시 사용자 정보 생성
        const tempUser: UserEntity = {
          userId: 1,
          username: '카카오 사용자',
          userkey: 'kakao_user',
          email: 'kakao@example.com',
          imageUrl: 'https://example.com/profile.jpg',
        };
        
        login(tempUser, token);
        Alert.alert('로그인 성공', `토큰: ${token}`);
        console.log('받은 토큰:', token);
        setShowWebView(false);
        
        if (onLoginSuccess) {
          onLoginSuccess(token);
        }
      }
    }
  };

  const injectedJavaScript = `
    // 페이지 로드 완료 후 실행될 스크립트
    window.addEventListener('load', function() {
      console.log('페이지 로드 완료');
      
      // 1. JSON 응답에서 토큰 찾기 (가장 일반적)
      try {
        const jsonElements = document.querySelectorAll('pre, code');
        for (let element of jsonElements) {
          try {
            const jsonData = JSON.parse(element.textContent);
            if (jsonData.token || jsonData.access_token) {
              const token = jsonData.token || jsonData.access_token;
              console.log('JSON에서 토큰 발견:', token);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                token: token,
                type: 'login_success',
                source: 'json'
              }));
              return;
            }
          } catch (e) {
            // JSON 파싱 실패는 무시
          }
        }
      } catch (e) {
        console.log('JSON 파싱 시도 중 오류:', e);
      }
      
      // 2. HTML body 텍스트에서 토큰 패턴 찾기
      const bodyText = document.body.innerText;
      const tokenPatterns = [
        /"token"\s*:\s*"([^"]+)"/i,
        /"access_token"\s*:\s*"([^"]+)"/i,
        /token\s*=\s*([^\\s,}]+)/i,
        /access_token\s*=\s*([^\\s,}]+)/i
      ];
      
      for (let pattern of tokenPatterns) {
        const match = bodyText.match(pattern);
        if (match && match[1]) {
          const token = match[1];
          console.log('패턴에서 토큰 발견:', token);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            token: token,
            type: 'login_success',
            source: 'pattern'
          }));
          return;
        }
      }
      
      // 3. 폼 제출 이벤트 감지
      document.addEventListener('submit', function(e) {
        console.log('폼 제출 감지');
        setTimeout(function() {
          checkForToken();
        }, 1000);
      });
      
      // 4. AJAX 응답 감지 (MutationObserver 사용)
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            setTimeout(function() {
              checkForToken();
            }, 500);
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // 토큰 확인 함수
      function checkForToken() {
        // JSON 응답 재확인
        try {
          const jsonElements = document.querySelectorAll('pre, code');
          for (let element of jsonElements) {
            try {
              const jsonData = JSON.parse(element.textContent);
              if (jsonData.token || jsonData.access_token) {
                const token = jsonData.token || jsonData.access_token;
                console.log('지연 확인에서 토큰 발견:', token);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  token: token,
                  type: 'login_success',
                  source: 'delayed_json'
                }));
                return;
              }
            } catch (e) {
              // JSON 파싱 실패는 무시
            }
          }
        } catch (e) {
          // 무시
        }
        
        // body 텍스트 재확인
        const currentBodyText = document.body.innerText;
        for (let pattern of tokenPatterns) {
          const match = currentBodyText.match(pattern);
          if (match && match[1]) {
            const token = match[1];
            console.log('지연 확인에서 패턴 토큰 발견:', token);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              token: token,
              type: 'login_success',
              source: 'delayed_pattern'
            }));
            return;
          }
        }
      }
      
      // 5. 초기 확인 후 3초 뒤 재확인
      setTimeout(function() {
        checkForToken();
      }, 3000);
    });
    
    true; // 필수
  `;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>뭐해모여</Text>
        <Text style={styles.subtitle}>카카오톡으로 간편하게 로그인하세요</Text>
        
        <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
          <Text style={styles.kakaoButtonText}>카카오톡으로 로그인하기</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <View style={styles.webViewContainer}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowWebView(false)}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
          
          <WebView
            ref={webViewRef}
            source={{ uri: `${SERVER_URL}/oauth2/authorization/kakao` }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            injectedJavaScript={injectedJavaScript}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        </View>
      </Modal>
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
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default LoginScreen;
