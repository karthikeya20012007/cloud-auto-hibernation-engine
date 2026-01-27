import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        // simulate auth delay
        await new Promise(resolve => setTimeout(resolve, 700));

        // realistic credential check
        if (username === 'admin' && password === 'admin123') {
            await AsyncStorage.setItem('auth_token', 'session_active');
            router.replace('/(tabs)');
            return;
        }

        setError('Invalid username or password');
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>
                Access your cloud governance dashboard
            </Text>

            <TextInput
                label="Username"
                mode="outlined"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                style={styles.input}
            />

            <TextInput
                label="Password"
                mode="outlined"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            {error !== '' && <Text style={styles.error}>{error}</Text>}

            <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.button}
            >
                Sign in
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#ffffff',
    },
    button: {
        marginTop: 8,
        paddingVertical: 4,
    },
    error: {
        color: '#dc2626',
        marginBottom: 8,
        textAlign: 'center',
    },
});
