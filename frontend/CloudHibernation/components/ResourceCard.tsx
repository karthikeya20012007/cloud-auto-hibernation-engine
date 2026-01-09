import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { approveStop } from '../services/api';

type Resource = {
    id: string;
    type: string;
    cpu: number;
    idle_minutes: number;
    state: 'running' | 'stopped';
    policy_status:
    | 'healthy'
    | 'warning'
    | 'approval-required'
    | 'auto-stopped'
    | 'stopped';
};

export default function ResourceCard({
    r,
    onStopped,
}: {
    r: Resource;
    onStopped: (id: string) => void;
}) {
    const router = useRouter();
    const [stopping, setStopping] = useState(false);

    async function handleStopNow() {
        if (stopping) return;

        try {
            setStopping(true);
            await approveStop(r.id);
            onStopped(r.id); // update dashboard instantly
        } catch {
            alert('Failed to stop VM');
        } finally {
            setStopping(false);
        }
    }

    return (
        <Pressable
            onPress={() => router.push(`/vm/${r.id}`)}
            style={{ marginBottom: 14 }}
        >
            <Card style={styles.card}>
                <Card.Content>
                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={styles.name}>{r.id}</Text>
                        <Chip style={statusStyle(r.policy_status)}>
                            {r.policy_status.toUpperCase()}
                        </Chip>
                    </View>

                    {/* METRICS */}
                    <Text style={styles.meta}>Type: {r.type}</Text>
                    <Text style={styles.meta}>CPU Usage: {r.cpu}%</Text>
                    <Text style={styles.meta}>Idle Time: {r.idle_minutes} min</Text>
                    <Text style={styles.meta}>State: {r.state}</Text>

                    {/* ACTION — STOP VM */}
                    {r.policy_status === 'approval-required' && (
                        <Button
                            mode="contained"
                            onPress={(e) => {
                                e.stopPropagation(); // 🔥 prevents card navigation
                                handleStopNow();
                            }}
                            loading={stopping}
                            disabled={stopping}
                            buttonColor="#dc2626"
                            style={{ marginTop: 8 }}
                        >
                            Stop VM
                        </Button>
                    )}
                </Card.Content>
            </Card>
        </Pressable>
    );
}

function statusStyle(status: string) {
    if (status === 'approval-required') return styles.approval;
    if (status === 'auto-stopped' || status === 'stopped') return styles.stopped;
    if (status === 'warning') return styles.warning;
    return styles.healthy;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    name: {
        flex: 1,
        marginRight: 8,
        fontWeight: '600',
        color: '#0f172a',
    },
    meta: {
        color: '#111827',
        fontSize: 13,
        marginBottom: 2,
        fontWeight: '500',
    },
    healthy: {
        backgroundColor: '#dcfce7',
    },
    warning: {
        backgroundColor: '#fef3c7',
    },
    stopped: {
        backgroundColor: '#fee2e2',
    },
    approval: {
        backgroundColor: '#fde68a',
    },
});
