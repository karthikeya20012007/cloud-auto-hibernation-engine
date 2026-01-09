import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';

import { fetchResources } from '../services/api';

export default function CloudAssistant() {
    const [query, setQuery] = useState('');
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<string | null>(null);

    useEffect(() => {
        fetchResources()
            .then((data) => setResources(data.resources))
            .finally(() => setLoading(false));
    }, []);

    function handleAsk() {
        if (!query.trim()) return;

        // 🔮 Simple rule-based assistant (MVP)
        if (query.toLowerCase().includes('warning')) {
            const count = resources.filter(
                r => r.policy_status === 'warning'
            ).length;

            setResponse(
                count === 0
                    ? 'All resources are operating normally.'
                    : `${count} resource(s) are approaching auto-stop thresholds.`
            );
            return;
        }

        if (query.toLowerCase().includes('stopped')) {
            const stopped = resources.filter(
                r => r.state === 'stopped'
            ).length;

            setResponse(
                `${stopped} resource(s) are currently stopped.`
            );
            return;
        }

        setResponse(
            'I can help you with warnings, stopped VMs, policies, and cost estimates.'
        );
    }

    if (loading) {
        return <Text>Loading assistant...</Text>;
    }

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.prompt}>
                        Ask about your cloud resources
                    </Text>

                    <TextInput
                        mode="outlined"
                        placeholder="e.g. Which VMs are in warning?"
                        value={query}
                        onChangeText={setQuery}
                        style={styles.input}
                    />

                    <Button
                        mode="contained"
                        onPress={handleAsk}
                        style={styles.button}
                    >
                        Ask
                    </Button>

                    {response && (
                        <View style={styles.responseBox}>
                            <Text style={styles.responseText}>{response}</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    prompt: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#0f172a',
    },
    input: {
        marginBottom: 8,
        backgroundColor: '#ffffff',
    },
    button: {
        marginBottom: 8,
    },
    responseBox: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    responseText: {
        fontSize: 13,
        color: '#0f172a',
    },
});
