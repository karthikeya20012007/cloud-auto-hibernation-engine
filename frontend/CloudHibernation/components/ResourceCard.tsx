import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';

type Resource = {
    id: string;
    type: string;
    cpu: number;
    idle_minutes: number;
    state: string;
    policy_status:
    | 'healthy'
    | 'warning'
    | 'auto-stopped'
    | 'approval-required';
};

export default function ResourceCard({ r }: { r: Resource }) {
    return (
        <Card style={styles.card}>
            <Card.Content>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{r.id}</Text>

                    <Chip
                        style={statusStyle(r.policy_status)}
                        textStyle={styles.chipText}
                    >
                        {r.policy_status.toUpperCase()}
                    </Chip>
                </View>

                {/* Metrics */}
                <Text style={styles.meta}>Type: {r.type}</Text>
                <Text style={styles.meta}>CPU Usage: {r.cpu}%</Text>
                <Text style={styles.meta}>Idle Time: {r.idle_minutes} min</Text>
                <Text style={styles.meta}>State: {r.state}</Text>

                {/* Policy explanation */}
                <View style={styles.policyBox}>
                    <Text style={styles.policyText}>
                        {policyMessage(r)}
                    </Text>

                    {r.policy_status === 'approval-required' && (
                        <Text style={styles.approvalHint}>
                            Awaiting user approval
                        </Text>
                    )}
                </View>
            </Card.Content>
        </Card>
    );
}

function policyMessage(r: Resource) {
    if (r.policy_status === 'auto-stopped') {
        return 'Auto-stopped after exceeding idle threshold as per policy.';
    }
    if (r.policy_status === 'approval-required') {
        return 'Idle threshold exceeded. Manual approval required before stopping.';
    }
    if (r.policy_status === 'warning') {
        return 'Approaching auto-stop threshold based on idle policy.';
    }
    return 'Resource operating within defined policy limits.';
}

function statusStyle(status: Resource['policy_status']) {
    if (status === 'auto-stopped') return styles.stopped;
    if (status === 'approval-required') return styles.approval;
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
    chipText: {
        fontWeight: '700',
        color: '#111827',
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
        backgroundColor: '#fde68a', // amber
    },
    policyBox: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
    policyText: {
        fontSize: 12,
        color: '#0f172a',
        fontWeight: '500',
    },
    approvalHint: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '700',
        color: '#92400e',
    },
});
