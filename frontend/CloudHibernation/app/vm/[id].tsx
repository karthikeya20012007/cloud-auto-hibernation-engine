import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { LineChart } from 'react-native-chart-kit';

import { fetchResources, approveStop } from '../../services/api';

const screenWidth = Dimensions.get('window').width;

// ----------------------------------
// DEMO TIME-SERIES
// ----------------------------------
function generateCpuSeries(baseCpu: number, id: string) {
    const seed = id.length;
    return Array.from({ length: 7 }, (_, i) =>
        Math.max(0, Math.min(100, baseCpu + ((i + seed) % 6) * 3 - 6))
    );
}

function generateCostSeries(vm: any) {
    const base =
        vm.type === 'compute-vm'
            ? 110
            : vm.type === 'k8s-node'
                ? 180
                : 90;

    const cpuFactor = vm.cpu * 1.4;
    const idlePenalty = vm.idle_minutes > 60 ? 12 : 0;

    const daily = (base + cpuFactor + idlePenalty) / 30;

    let acc = 0;
    return Array.from({ length: 7 }, (_, i) => {
        acc += daily + i * 0.7;
        return Math.round(acc);
    });
}

export default function VmDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [vm, setVm] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stopping, setStopping] = useState(false);

    function loadVm() {
        setLoading(true);
        fetchResources()
            .then((data) => {
                const found = data.resources.find((r: any) => r.id === id);
                setVm(found);
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        loadVm();
    }, [id]);

    async function handleStopVm() {
        try {
            setStopping(true);
            await approveStop(vm.id);
            loadVm(); // refresh after approval
        } catch {
            alert('Failed to stop VM');
        } finally {
            setStopping(false);
        }
    }

    if (loading) {
        return <Text style={{ padding: 16 }}>Loading VM details...</Text>;
    }

    if (!vm) {
        return <Text style={{ padding: 16 }}>VM not found.</Text>;
    }

    const cpuSeries = generateCpuSeries(vm.cpu, vm.id);
    const costSeries = generateCostSeries(vm);

    const canApproveStop =
        vm.policy_status === 'approval-required' && vm.state !== 'stopped';

    return (
        <ScrollView style={styles.container}>
            <Button icon="arrow-left" onPress={() => router.back()}>
                Back
            </Button>

            <Text style={styles.title}>{vm.id}</Text>

            <Chip style={statusStyle(vm.policy_status)}>
                {vm.policy_status.toUpperCase()}
            </Chip>

            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.meta}>Instance: {vm.instance_type}</Text>
                    <Text style={styles.meta}>CPU: {vm.cpu}%</Text>
                    <Text style={styles.meta}>Idle Time: {vm.idle_minutes} min</Text>
                    <Text style={styles.meta}>State: {vm.state}</Text>
                </Card.Content>
            </Card>

            {canApproveStop && (
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.warningText}>
                            This VM exceeded idle thresholds and requires manual approval
                            before stopping.
                        </Text>

                        <Button
                            mode="contained"
                            onPress={handleStopVm}
                            loading={stopping}
                            disabled={stopping}
                            buttonColor="#dc2626"
                            style={{ marginTop: 8 }}
                        >
                            Stop VM Now
                        </Button>
                    </Card.Content>
                </Card>
            )}

            <Text style={styles.section}>CPU Utilization (Last 7 Days)</Text>
            <Card style={styles.card}>
                <Card.Content>
                    <LineChart
                        data={{
                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            datasets: [{ data: cpuSeries }],
                        }}
                        width={screenWidth - 48}
                        height={220}
                        yAxisSuffix="%"
                        chartConfig={chartConfig('#16a34a')}
                    />
                </Card.Content>
            </Card>

            <Text style={styles.section}>Estimated Cost Accumulation</Text>
            <Card style={styles.card}>
                <Card.Content>
                    <LineChart
                        data={{
                            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                            datasets: [{ data: costSeries }],
                        }}
                        width={screenWidth - 48}
                        height={220}
                        yAxisLabel="$"
                        chartConfig={chartConfig('#2563eb')}
                    />
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

// ----------------------------------
function chartConfig(color: string) {
    return {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: () => color,
        labelColor: () => '#0f172a',
    };
}

function statusStyle(status: string) {
    if (status === 'approval-required') return styles.approval;
    if (status === 'stopped' || status === 'auto-stopped') return styles.stopped;
    if (status === 'warning') return styles.warningChip;
    return styles.healthy;
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginVertical: 12,
        color: '#0f172a',
    },
    section: {
        marginTop: 16,
        marginBottom: 8,
        fontWeight: '700',
        color: '#0f172a',
    },
    card: {
        marginBottom: 12,
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    meta: {
        fontSize: 14,
        color: '#111827',
        marginBottom: 4,
    },
    warningText: {
        color: '#92400e',
        fontWeight: '600',
    },
    healthy: {
        backgroundColor: '#dcfce7',
    },
    warningChip: {
        backgroundColor: '#fef3c7',
    },
    stopped: {
        backgroundColor: '#fee2e2',
    },
    approval: {
        backgroundColor: '#fde68a',
    },
});
