import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getBaseUrl() {
    // Android Emulator
    if (Platform.OS === 'android' && !Constants.isDevice) {
        return 'http://10.0.2.2:8000';
    }

    // Physical phone (Expo Go)
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        const host = hostUri.split(':').shift();
        return `http://${host}:8000`;
    }

    // Web fallback
    return 'http://localhost:8000';
}

const BASE_URL = getBaseUrl();

export async function fetchResources() {
    const res = await fetch('http://192.168.1.9:8000/resources');
    if (!res.ok) {
        throw new Error('Network error');
    }
    return res.json();
}
