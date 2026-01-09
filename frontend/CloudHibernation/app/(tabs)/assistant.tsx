import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import CloudAssistant from '../../components/CloudAssistant';

export default function AssistantScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cloud Assistant</Text>
            <CloudAssistant />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        color: '#0f172a',
    },
});
