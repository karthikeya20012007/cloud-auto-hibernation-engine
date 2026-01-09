import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function PolicyBanner({ policy }: { policy: any }) {
    return (
        <Card style={styles.card}>
            <Card.Content>
                <Text style={styles.title}>Active Auto-Hibernation Policy</Text>

                <Text style={styles.text}>
                    Idle warning at <Text style={styles.bold}>{policy.idle_warn_minutes} min</Text>
                </Text>
                <Text style={styles.text}>
                    Auto-stop at <Text style={styles.bold}>{policy.idle_stop_minutes} min</Text>
                </Text>
                <Text style={styles.text}>
                    CPU idle threshold <Text style={styles.bold}>{policy.cpu_idle_threshold}%</Text>
                </Text>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        backgroundColor: '#eff6ff',
        borderRadius: 12,
    },
    title: {
        fontWeight: '700',
        color: '#1e40af',
        marginBottom: 6,
    },
    text: {
        color: '#111827',
        marginBottom: 2,
    },
    bold: {
        fontWeight: '600',
    },
});
