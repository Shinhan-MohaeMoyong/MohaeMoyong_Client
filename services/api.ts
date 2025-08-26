import { SERVER_URL } from '../constants/server';
import { TokenManager } from '../contexts/tokenManager';
import { AccountDetailDTO } from '../types/dto/AccountDetailDTO';

export class HttpError extends Error {
  status: number;
  body: string;
  constructor(status: number, body: string) {
    super(`HTTP error! status: ${status}, message: ${body}`);
    this.status = status;
    this.body = body;
  }
}

export const buildUrl = (pathOrUrl: string): string => {
  const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
  if (isAbsolute) return pathOrUrl;
  const prefix = pathOrUrl.startsWith('/') ? '' : '/';
  return `${SERVER_URL}${prefix}${pathOrUrl}`;
};

export const apiFetch = async (pathOrUrl: string, init: RequestInit = {}): Promise<Response> => {
  const url = buildUrl(pathOrUrl);
  const token = await TokenManager.getToken();

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };

  if (token) {
    mergedHeaders['Authorization'] = `Bearer ${token}`;
  }
  const method = (init.method || 'GET').toString().toUpperCase();
  console.log(`[api] ${method} ${url}`);
  const response = await fetch(url, {
    ...init,
    headers: mergedHeaders,
  });
  console.log(`[api] <- ${response.status} ${method} ${url}`);
  return response;
};

export const fetchJson = async <T>(pathOrUrl: string, init: RequestInit = {}): Promise<T> => {
  const response = await apiFetch(pathOrUrl, init);
  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpError(response.status, errorText);
  }
  return response.json() as Promise<T>;
};

// 계좌 상세 정보 조회 함수
export const fetchAccountDetail = async (accountNo: string): Promise<AccountDetailDTO> => {
  return fetchJson<AccountDetailDTO>(`/api/v1/account/${encodeURIComponent(accountNo)}`);
};


