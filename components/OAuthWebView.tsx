// OAuthWebView.tsx
import React, { useCallback, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  authUrl: string;
  allowedRedirects: string[];          // startsWith 매칭
  onToken: (token: string) => void;
  onClose?: () => void;
};

function extractTokenFromUrl(url: string): string | null {
  try {
    // #token=... 도 지원
    const hasHash = url.includes("#");
    const [base, hash = ""] = url.split("#");
    const u = new URL(base);
    const q = u.searchParams.get("token");
    if (q) return q;

    if (hasHash) {
      const hp = new URLSearchParams(hash);
      const t = hp.get("token") || hp.get("access_token");
      if (t) return t;
    }
  } catch {
    // URL 생성 실패 시 정규식 백업
    const m = url.match(/[?#&]token=([^&#]+)/);
    if (m?.[1]) return decodeURIComponent(m[1]);
  }
  return null;
}

function isAllowedRedirect(url: string, allowList: string[]) {
  return allowList.some(prefix => url.startsWith(prefix));
}

export default function OAuthWebView({ authUrl, allowedRedirects, onToken, onClose }: Props) {
  const webRef = useRef<WebView>(null);

  const intercept = useCallback((url: string) => {
    if (!isAllowedRedirect(url, allowedRedirects)) return false;
    const token = extractTokenFromUrl(url);
    if (token) {
      onToken(token);          // ✅ 토큰 전달
      return true;             // 이 URL 로드는 막음
    }
    return false;
  }, [allowedRedirects, onToken]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ fontSize: 16 }}>닫기</Text>
        </TouchableOpacity>
        <Text style={{ fontWeight: "600" }}>소셜 로그인</Text>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        ref={webRef}
        source={{ uri: authUrl }}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        mixedContentMode="always"
        originWhitelist={["*"]}
        setSupportMultipleWindows={false}
        startInLoadingState

        // ✅ 리다이렉트 "시도" 순간에 먼저 가로챔 (가장 중요)
        onShouldStartLoadWithRequest={(req) => {
          if (intercept(req.url)) return false;  // 로드 막기 → 모달은 부모에서 닫음
          return true;
        }}

        // 보조 훅 (상황에 따라 한 번 더 안전망)
        onNavigationStateChange={(nav) => {
          if (intercept(nav.url)) {
            if (webRef.current && nav.canGoBack) {
              webRef.current.goBack();
            }
          }
        }}
      />
    </View>
  );
}
