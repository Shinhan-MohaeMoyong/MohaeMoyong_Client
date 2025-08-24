// Server 주소
export const SERVER_URL = "https://mohaemoyong.store";

// 토큰 관리
let currentToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzU2MDQwNTUwLCJleHAiOjE3NTYwNjIxNTB9.VToqOjsZzht2CTXeDBG_CBefFL52I5jlqIIxp0VLsEOGuvE2NOh2GndsvgO9QX1ZHlyDkQWQq6722GDasMaGwg";

export let TOKEN = currentToken;

// 토큰 업데이트 함수
export const updateToken = (newToken: string) => {
  currentToken = newToken;
  TOKEN = newToken;
  console.log('토큰이 업데이트되었습니다:', TOKEN);
};

// 현재 토큰 가져오기
export const getToken = () => currentToken;