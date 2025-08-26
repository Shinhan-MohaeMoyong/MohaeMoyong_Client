import LogoutBtn from '@/components/mypage/LogoutBtn';
import MenuItem from '@/components/mypage/MenuItem';
import { SERVER_URL } from '@/constants/server';
import { getToken } from '@/contexts/tokenManager';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


// 사용자 정보 타입 정의
type UserInfo = {
  userId: string;
  username: string;
  userkey: string;
  email: string;
  imageUrl: string;
};

export default function MyPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${SERVER_URL}/user/me`, {
          headers: { Authorization: `Bearer ${await getToken()}` }
          // credentials: 'include',
        });

        if (!res.ok) {
          // 404/401 등 명시적으로 처리
          throw new Error(`API ${res.status} ${res.statusText}`);
        }

        const data: UserInfo = await res.json();
        setUser(data);
      } catch (e: any) {
        console.error('마이페이지 사용자 조회 실패:', e);
        setError(e.message);
      }
    })();
  }, []);

  if (error && !user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>불러오는 중 오류가 발생했어요: {error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>로딩중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>계정</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: user.imageUrl }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.username}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.iconText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Cards */}
        <View style={styles.menuCard}>
          <MenuItem icon="🗓️" label="일정관리" />
          <MenuItem icon="💳" label="계좌관리" />
          <MenuItem icon="👥" label="친구관리" />
        </View>
        <View style={styles.menuCard}>
            <LogoutBtn />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingTop: 48, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1,
  },
  profileImage: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: 'bold' },
  profileSub: { fontSize: 13, color: '#666', marginTop: 2 },
  profileEmail: { fontSize: 13, color: '#888', marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 8, fontSize: 15, color: '#222' },
  menuCard: {
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, marginVertical: 8,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { marginLeft: 12, fontSize: 16, color: '#222' },
  bottomTab: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: '#fff', paddingVertical: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    elevation: 10,
  },
  tabItem: { alignItems: 'center', flex: 1 },
  tabLabel: { fontSize: 12, marginTop: 2, color: '#888' },
  iconText: { fontSize: 20, color: '#222' },
});