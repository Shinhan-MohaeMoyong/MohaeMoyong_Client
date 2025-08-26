import MyPage from '@/screens/MyPageScreen';
import { useUser } from '../../contexts/UserContext';

export default function ProfileScreen() {
  const { loggedUser, logout } = useUser();

  return (
    <MyPage />
  );
}