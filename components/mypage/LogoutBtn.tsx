import { useUser } from '@/contexts/UserContext';
import { removeToken } from '@/contexts/tokenManager';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const LogoutBtn: React.FC = () => {
	const { logout } = useUser();

	const handleLogout = async () => {
        try {
            await removeToken();
            await logout();
            router.replace('/login');
        } catch (e) {
            console.error('로그아웃 실패:', e);
        }
        };

	return (
		<TouchableOpacity style={styles.button} onPress={handleLogout}>
			<Text style={styles.text}>로그아웃</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		backgroundColor: '#ff5252',
		borderRadius: 8,
		alignItems: 'center',
		marginVertical: 8,
	},
	text: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
});

export default LogoutBtn;
