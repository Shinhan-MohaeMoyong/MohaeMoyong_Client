// Server 주소
export const SERVER_URL = "https://mohaemoyong.store";

// 토큰 관리
let currentToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzU2MDEwMTI4LCJleHAiOjE3NTYwMzE3Mjh9.X4bLdKCpd23fF8dxGR7IjiU3EcXTADXTtNGfSlYqfGuvsXW6IZnwWA-hA0OKcfAeTbIMwp0JA9UXoAspoZ3gvg";

export const TOKEN = currentToken;

// 토큰 업데이트 함수
export const updateToken = (newToken: string) => {
  currentToken = newToken;
  console.log('토큰이 업데이트되었습니다:', newToken);
};

// 현재 토큰 가져오기
export const getToken = () => currentToken;