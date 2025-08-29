// // screens/LoginScreen2.tsx
// import { SERVER_URL } from '@/constants/server';
// import * as Linking from 'expo-linking';
// import * as WebBrowser from 'expo-web-browser';
// import { useCallback, useEffect, useRef, useState } from 'react';
// import {
//   Alert,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';

// interface LoginScreen2Props {
//   onLoginSuccess?: (token: string) => void;
// }

// const redirectUri = 'test://index';

// export default function LoginScreen2({ onLoginSuccess }: LoginScreen2Props) {
//   const subRef = useRef<(() => void) | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // email/password UI용 상태
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPass, setShowPass] = useState(false);

//   // ──────────────────────────────
//   // 토큰 추출 + 카카오 OAuth 로직
//   // ──────────────────────────────
//   const extractToken = useCallback(
//     (url: string) => {
//       try {
//         const parsed = Linking.parse(url);
//         const qp = parsed.queryParams ?? {};
//         const t =
//           (qp.token as string | undefined) ||
//           new URL(url).searchParams.get('token') ||
//           new URL(url).hash.replace(/^#/, '').split('&').find(s => s.startsWith('access_token='))?.split('=')[1] ||
//           null;

//         if (t) {
//           setIsLoading(false);
//           Alert.alert('로그인 성공!', '카카오 인증이 완료되었습니다.', [
//             { text: '확인', onPress: () => onLoginSuccess?.(t) },
//           ]);
//           return true;
//         }
//       } catch (error) {
//         console.error('토큰 추출 에러:', error);
//       }
//       return false;
//     },
//     [onLoginSuccess]
//   );

//   useEffect(() => {
//     WebBrowser.maybeCompleteAuthSession();
//   }, []);

//   useEffect(() => {
//     const checkInitialURL = async () => {
//       try {
//         const initialURL = await Linking.getInitialURL();
//         if (initialURL) extractToken(initialURL);
//       } catch (error) {
//         console.error('초기 URL 체크 에러:', error);
//       }
//     };
//     checkInitialURL();
//   }, [extractToken]);

//   useEffect(() => {
//     const onUrl = ({ url }: { url: string }) => extractToken(url);
//     const sub = Linking.addEventListener('url', onUrl);
//     subRef.current = () => sub.remove();
//     return () => subRef.current?.();
//   }, [extractToken]);

//   const handleKakaoLogin = useCallback(async () => {
//     if (isLoading) return;
//     setIsLoading(true);
//     const authUrl = `${SERVER_URL}/oauth2/authorization/kakao?redirect_uri=${encodeURIComponent(redirectUri)}`;

//     try {
//       const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
//         showInRecents: true,
//         createTask: false,
//       });

//       if (result.type === 'success' && result.url) {
//         extractToken(result.url);
//       } else {
//         setIsLoading(false);
//       }
//     } catch (error) {
//       console.error('WebBrowser 에러:', error);
//       setIsLoading(false);
//       Alert.alert('오류', '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
//     }
//   }, [isLoading, extractToken]);

//   const handleEmailLogin = () => {
//     Alert.alert('로그인', '이메일/패스워드 로그인 로직을 연결하세요.');
//   };

//   // ──────────────────────────────
//   // UI
//   // ──────────────────────────────
//   return (
//     <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.select({ ios: 'padding', android: undefined })}>
//       <ScrollView
//         style={{ flex: 1, backgroundColor: '#fff' }}
//         contentContainerStyle={{ flexGrow: 1 }}
//         keyboardShouldPersistTaps="handled"
//       >
//         <View style={styles.screen}>
//           <View style={styles.card}>
//             {/* 로고 */}
//             <Image source={require('@/assets/images/loadinglogo.png')} style={styles.logo} resizeMode="contain" />

//             {/* 이메일 인풋 */}
//             <View style={styles.inputWrapper}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Email"
//                 placeholderTextColor="#C8CBD3"
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 value={email}
//                 onChangeText={setEmail}
//               />
//             </View>

//             {/* 패스워드 인풋 */}
//             <View style={styles.inputWrapper}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Password"
//                 placeholderTextColor="#C8CBD3"
//                 secureTextEntry={!showPass}
//                 value={password}
//                 onChangeText={setPassword}
//               />
//               <Pressable style={styles.eye} onPress={() => setShowPass(p => !p)}>
//                 <Text style={{ color: '#9AA0A6' }}>{showPass ? '👁️' : '👁️‍🗨️'}</Text>
//               </Pressable>
//             </View>

//             {/* 보라색 Log in 버튼 */}
//             <TouchableOpacity style={styles.loginBtn} onPress={handleEmailLogin} activeOpacity={0.9}>
//               <Text style={styles.loginBtnText}>Log in</Text>
//             </TouchableOpacity>

//             {/* 비밀번호 찾기 */}
//             <TouchableOpacity onPress={() => Alert.alert('안내', '비밀번호 찾기 화면을 연결하세요.')}>
//               <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
//             </TouchableOpacity>

//             {/* 구분선 */}
//             <View style={styles.dividerRow}>
//               <View style={styles.divider} />
//               <Text style={styles.or}>or</Text>
//               <View style={styles.divider} />
//             </View>

//             {/* 카카오 로그인 */}
//             <TouchableOpacity
//   style={[styles.kakaoBtn, isLoading && styles.kakaoBtnDisabled]}
//   onPress={handleKakaoLogin}
//   activeOpacity={0.9}
//   disabled={isLoading}
// >
//   <Image
//     source={require('@/assets/images/kakao-icon.png')}
//     style={styles.kakaoImg}
//     resizeMode="contain"
//   />
// </TouchableOpacity>

//             {/* 회원가입 */}
//             <View style={{ height: 24 }} />
//             <Text style={styles.signupRow}>
//               계정이 없으신가요? <Text style={styles.signupLink}>회원 가입</Text>
//             </Text>
//           </View>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const PURPLE = '#6C5CE7';
// const KAKAO_YELLOW = '#FEE500';
// const CARD_BG = '#FFFFFF';
// const SHADOW = {
//   shadowColor: '#000',
//   shadowOpacity: 0.08,
//   shadowRadius: 12,
//   shadowOffset: { width: 0, height: 6 },
//   elevation: 6,
// };

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//     backgroundColor: '#fff', 
//     paddingHorizontal: 16,
//     paddingVertical: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   card: {
//     width: '100%',
//     maxWidth: 420,
//     backgroundColor: CARD_BG,
//     borderRadius: 28,
//     paddingHorizontal: 20,
//     paddingVertical: 28,
//     ...SHADOW,
//   },
//   logo: {
//     width: '100%',
//     height: 150,
//     alignSelf: 'center',
//     marginBottom: 24,
//   },
//   inputWrapper: {
//     position: 'relative',
//     width: '100%',
//     marginBottom: 14,
//   },
//   input: {
//     width: '100%',
//     backgroundColor: '#F3F5F8',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     fontSize: 16,
//     color: '#2B2F36',
//   },
//   eye: {
//     position: 'absolute',
//     right: 12,
//     top: 0,
//     bottom: 0,
//     justifyContent: 'center',
//   },
//   loginBtn: {
//     marginTop: 6,
//     backgroundColor: PURPLE,
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   loginBtnText: {
//     color: '#FFF',
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   forgotText: {
//     marginTop: 12,
//     textAlign: 'center',
//     color: '#1E6ACB',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   dividerRow: {
//     marginTop: 18,
//     marginBottom: 10,
//     width: '100%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   divider: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#E5E7EB',
//   },
//   or: {
//     width: 28,
//     textAlign: 'center',
//     color: '#9AA0A6',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   kakaoBtn: {
//     marginTop: 16,
//     alignSelf: 'center',     // 화면 가운데 정렬
//     width: 280,              // 버튼 너비
//     height: 45,              // 버튼 높이 (카카오 가이드 기본 크기)
//   },
//   kakaoBtnDisabled: {
//     opacity: 0.7,
//   },
//   kakaoImg: {
//     width: '100%',
//     height: '100%',
//   },
//   signupRow: {
//     fontSize: 14,
//     color: '#999',
//     textAlign: 'center',
//   },
//   signupLink: {
//     color: '#1E6ACB',
//     fontWeight: '600',
//   },
// });

// screens/LoginScreen2.tsx

// screens/LoginScreen2.tsx
import { SERVER_URL } from '@/constants/server';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LoginScreen2Props {
  onLoginSuccess?: (token: string) => void;
}

const redirectUri = 'test://index';

export default function LoginScreen2({ onLoginSuccess }: LoginScreen2Props) {
  const subRef = useRef<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ──────────────────────────────
  // 토큰 추출 + 카카오 OAuth 로직
  // ──────────────────────────────
  const extractToken = useCallback(
    (url: string) => {
      try {
        const parsed = Linking.parse(url);
        const qp = parsed.queryParams ?? {};
        const t =
          (qp.token as string | undefined) ||
          new URL(url).searchParams.get('token') ||
          new URL(url).hash.replace(/^#/, '').split('&').find(s => s.startsWith('access_token='))?.split('=')[1] ||
          null;

        if (t) {
          setIsLoading(false);
          Alert.alert('로그인 성공!', '카카오 인증이 완료되었습니다.', [
            { text: '확인', onPress: () => onLoginSuccess?.(t) },
          ]);
          return true;
        }
      } catch (error) {
        console.error('토큰 추출 에러:', error);
      }
      return false;
    },
    [onLoginSuccess]
  );

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    const checkInitialURL = async () => {
      try {
        const initialURL = await Linking.getInitialURL();
        if (initialURL) extractToken(initialURL);
      } catch (error) {
        console.error('초기 URL 체크 에러:', error);
      }
    };
    checkInitialURL();
  }, [extractToken]);

  useEffect(() => {
    const onUrl = ({ url }: { url: string }) => extractToken(url);
    const sub = Linking.addEventListener('url', onUrl);
    subRef.current = () => sub.remove();
    return () => subRef.current?.();
  }, [extractToken]);

  const handleKakaoLogin = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    const authUrl = `${SERVER_URL}/oauth2/authorization/kakao?redirect_uri=${encodeURIComponent(redirectUri)}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri, {
        showInRecents: true,
        createTask: false,
      });

      if (result.type === 'success' && result.url) {
        extractToken(result.url);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('WebBrowser 에러:', error);
      setIsLoading(false);
      Alert.alert('오류', '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  }, [isLoading, extractToken]);

  // ──────────────────────────────
  // UI
  // ──────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: '#fff' }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.screen}>
          <View style={styles.card}>
            {/* 앱 로고 */}
            <Image source={require('@/assets/images/loadinglogo.png')} style={styles.logo} resizeMode="contain" />

            {/* 앱 소개글 */}
            <Text style={styles.appDesc}>
              오늘의 일정은 공유하고,{'\n'}
              내일의 목표는 <Text style={styles.highlight}>함께 모아요 ✨</Text>
            </Text>

            {/* 카카오 로그인 버튼 (공식 버튼 이미지) */}
            <TouchableOpacity
              style={[styles.kakaoBtn, isLoading && styles.kakaoBtnDisabled]}
              onPress={handleKakaoLogin}
              activeOpacity={0.9}
              disabled={isLoading}
            >
              <Image
                source={require('@/assets/images/kakao-icon.png')}
                style={styles.kakaoImg}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* 회원가입 안내 */}
            <View style={{ height: 24 }} />
            <Text style={styles.signupRow}>
              아직 계정이 없으신가요? <Text style={styles.signupLink}>회원가입</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const PURPLE = '#6C5CE7';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 28,
    alignItems: 'center',
  },
  logo: {
    width: 500,
    height: 500,
     marginBottom: 12,
  },
  appDesc: {
    fontSize: 18,
    textAlign: 'center',
    color: '#444',
    lineHeight: 26,
    marginBottom: 40,
  },
  highlight: {
    color: PURPLE,
    fontWeight: '700',
  },
  kakaoBtn: {
    marginTop: 16,
    alignSelf: 'center',
    width: 280,
    height: 45,
  },
  kakaoBtnDisabled: {
    opacity: 0.7,
  },
  kakaoImg: {
    width: '100%',
    height: '100%',
  },
  signupRow: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  signupLink: {
    color: '#1E6ACB',
    fontWeight: '600',
  },
});
