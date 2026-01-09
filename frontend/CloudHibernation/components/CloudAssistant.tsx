import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button } from 'react-native-paper';

type Message = {
    role: 'user' | 'assistant';
    text: string;
};

export default function CloudAssistant({
    policy,
    resources,
}: {
    policy: any;
    resources: any[];
}) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            text:
                'I am your Cloud Operations Assistant. I can help explain policy actions, stopped resources, and optimization recommendations.',
        },
    ]);
    const [input, setInput] = useState('');

    function sendMessage() {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', text: input };
        const reply: Message = {
            role: 'assistant',
            text: generateReply(input),
        };

        setMessages((prev) => [...prev, userMsg, reply]);
        setInput('');
    }

    function generateReply(text: string) {
        const stopped = resources.filter(r => r.policy_status === 'auto-stopped');

        if (text.toLowerCase().includes('why')) {
            return `Resources are auto-stopped when idle time exceeds ${policy.idle_stop_minutes} minutes with CPU below ${policy.cpu_idle_threshold}%.`;
        }

        if (text.toLowerCase().includes('stopped')) {
            if (stopped.length === 0) return 'No resources are currently auto-stopped.';
            return `Currently auto-stopped resources:\n• ${stopped.map(r => r.id).join('\n• ')}`;
        }

        if (text.toLowerCase().includes('policy')) {
            return `Active policy:\n• Warn at ${policy.idle_warn_minutes} min idle\n• Stop at ${policy.idle_stop_minutes} min idle\n• CPU idle threshold ${policy.cpu_idle_threshold}%`;
        }

        return 'I can help explain policy decisions, stopped resources, or optimization recommendations.';
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                {messages.map((m, i) => (
                    <Card
                        key={i}
                        style={[
                            styles.message,
                            m.role === 'assistant' ? styles.assistant : styles.user,
                        ]}
                    >
                        <Card.Content>
                            <Text style={styles.text}>{m.text}</Text>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>

            <View style={styles.inputRow}>
                <TextInput
                    mode="outlined"
                    value={input}
                    onChangeText={setInput}
                    placeholder="Ask about policies, stopped resources..."
                    style={styles.input}
                />
                <Button mode="contained" onPress={sendMessage}>
                    Send
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f8fc',
    },
    message: {
        margin: 8,
        maxWidth: '85%',
    },
    assistant: {
        alignSelf: 'flex-start',
        backgroundColor: '#e8f0fe',
    },
    user: {
        alignSelf: 'flex-end',
        backgroundColor: '#ffffff',
    },
    text: {
        color: '#202124',
        fontSize: 14,
    },
    inputRow: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderColor: '#dadce0',
    },
    input: {
        flex: 1,
        marginRight: 8,
    },
});
