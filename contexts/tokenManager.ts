import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '../constants/server';

const TOKEN_KEY = 'auth_token';

// 웹 환경 감지
const isWeb = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// 플랫폼별 저장소 관리
class StorageManager {
  static async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  }

  static async getItem(key: string): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  }

  static async removeItem(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
}

export class TokenManager {
  // 토큰 저장
  static async saveToken(token: string): Promise<void> {
    try {
      await StorageManager.setItem(TOKEN_KEY, token);
      console.log('토큰 저장 완료');
    } catch (error) {
      console.error('토큰 저장 실패:', error);
    }
  }

  // 토큰 가져오기
  static async getToken(): Promise<string | null> {
    try {
      // const token = await StorageManager.getItem(TOKEN_KEY);
      // return token;

      return 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI1IiwiaWF0IjoxNzU2MTg1MjE4LCJleHAiOjE3NTYyMDY4MTh9.xQ292GTig3FZTFRQKIemLkIkGkfVVZAGje3V6cYOOjaIhG9sS122N9YjefLqOteKNPYuu7NAixY3x4mprbt-gQ';
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
      return null;
    }
  }

  // 토큰 삭제
  static async removeToken(): Promise<void> {
    try {
      await StorageManager.removeItem(TOKEN_KEY);
      console.log('토큰 삭제 완료');
    } catch (error) {
      console.error('토큰 삭제 실패:', error);
    }
  }

  // 토큰 유효성 검사 (/user/me 엔드포인트로 확인)
  static async isTokenValid(token: string): Promise<boolean> {
    if (!token) return false;
    
    try {
      const response = await fetch(`${SERVER_URL}/user/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('토큰 유효성 검사 실패:', error);
      return false;
    }
  }

  // 토큰 상태 확인 (로그인 필요 여부)
  static async checkAuthStatus(): Promise<{ isValid: boolean; token: string | null }> {
    const token = await this.getToken();
    
    if (!token) {
      return { isValid: false, token: null };
    }
    
    const isValid = await this.isTokenValid(token);
    return { isValid, token };
  }
}

// 기본 토큰 (fallback)
export const DEFAULT_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI0IiwiaWF0IjoxNzU2MTY3MzIyLCJleHAiOjE3NTYxODg5MjJ9.c4ftJ96HMPhFHCYi9KjnRNPlxTwDUAyORvdKWuYRqx3evZDcVTFWI6YW7MR435d5VRRYfAqFXXqkjPO_j6omug';

// 편의를 위한 함수들 export
export const getToken = TokenManager.getToken;
export const saveToken = TokenManager.saveToken;
export const removeToken = TokenManager.removeToken;
export const isTokenValid = TokenManager.isTokenValid;
export const checkAuthStatus = TokenManager.checkAuthStatus;
