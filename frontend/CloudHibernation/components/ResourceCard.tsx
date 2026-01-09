import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
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
    const [stopping, setStopping] = useState(false);

    async function handleStopNow() {
        if (stopping) return;

        try {
            setStopping(true);
            await approveStop(r.id);
            onStopped(r.id); // 🔥 refresh parent
        } catch {
            alert('Failed to stop VM');
        } finally {
            setStopping(false);
        }
    }

    return (
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

                {/* ACTION — ONLY WHEN APPROVAL REQUIRED */}
                {r.policy_status === 'approval-required' && (
                    <Button
                        mode="contained"
                        onPress={handleStopNow}
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
        marginBottom: 14,
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
