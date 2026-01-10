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
    | 'never-stop';
};

export default function ResourceCard({
    r,
    onStopped,
}: {
    r: Resource;
    onStopped: (id: string) => void;
}) {
    const [stopping, setStopping] = useState(false);
    const router = useRouter();

    async function handleStopNow() {
        if (stopping) return;

        try {
            setStopping(true);
            await approveStop(r.id);
            onStopped(r.id);
        } catch (err: any) {
            alert(err?.message || 'Failed to stop VM');
        } finally {
            setStopping(false);
        }
    }

    return (
        <Pressable onPress={() => router.push(`/vm/${r.id}`)}>
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

                    {/* STOP BUTTON */}
                    {r.policy_status === 'approval-required' && (
                        <Button
                            mode="contained"
                            onPress={handleStopNow}
                            loading={stopping}
                            disabled={stopping}
                            buttonColor="#dc2626"
                            style={styles.stopButton}
                        >
                            Approve & Stop VM
                        </Button>
                    )}
                </Card.Content>
            </Card>
        </Pressable>
    );
}

/* ------------------ HELPERS ------------------ */

function statusStyle(status: Resource['policy_status']) {
    switch (status) {
        case 'healthy':
            return styles.healthy;
        case 'warning':
            return styles.warning;
        case 'auto-stopped':
            return styles.stopped;
        case 'approval-required':
            return styles.approval;
        case 'never-stop':
            return styles.neverStop;
        default:
            return styles.healthy;
    }
}

/* ------------------ STYLES ------------------ */

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
        color: '#000000',
    },
    meta: {
        color: '#000000',
        fontSize: 13,
        marginBottom: 2,
        fontWeight: '500',
    },
    stopButton: {
        marginTop: 10,
    },
    healthy: { backgroundColor: '#dcfce7' },
    warning: { backgroundColor: '#fef3c7' },
    stopped: { backgroundColor: '#fee2e2' },
    approval: { backgroundColor: '#fde68a' },
    neverStop: { backgroundColor: '#e0e7ff' },
});
