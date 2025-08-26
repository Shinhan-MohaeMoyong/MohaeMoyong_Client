import { useEffect, useState } from 'react';

export type UserInfo = {
  userId: string;
  username: string;
  userkey: string;
  email: string;
  imageUrl: string;
};

export function useUserInfo() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 API 호출로 교체하세요!
    fetch('/user/me')
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { user, loading };
}