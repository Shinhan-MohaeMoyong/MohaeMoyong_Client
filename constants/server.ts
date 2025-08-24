// Server 주소
export const SERVER_URL = "https://mohaemoyong.store";

// 토큰 관리
let currentToken = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzU1OTY1OTMxLCJleHAiOjE3NTU5ODc1MzF9.crYN0p4LUlu8GCyUrShsgR5OC6CA5ICXmAgdBmJ_0bjWlaHP_Y_Ps5EG4efjWYuaC9I8-xO0qe0OS7d-6mccQQ";

export const TOKEN = currentToken;

// 토큰 업데이트 함수
export const updateToken = (newToken: string) => {
  currentToken = newToken;
  console.log('토큰이 업데이트되었습니다:', newToken);
};

// 현재 토큰 가져오기
export const getToken = () => currentToken;