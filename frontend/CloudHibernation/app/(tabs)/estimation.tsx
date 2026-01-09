import { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Card, SegmentedButtons } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Dropdown } from 'react-native-paper-dropdown';

const screenWidth = Dimensions.get('window').width;

/* ---------------- TYPES ---------------- */
type VmType =
    | 'e2-standard-2'
    | 'n2-standard-4'
    | 'c2-standard-8'
    | 'g4dn.xlarge';

type Provider = 'gcp' | 'aws' | 'azure';

/* ---------------- MOCK COST DATA ---------------- */
const VM_COST_DATA: Record<VmType, Record<Provider, number[]>> = {
    'e2-standard-2': {
        gcp: [70, 72, 75, 78, 82, 88, 92],
        aws: [80, 84, 87, 92, 96, 102, 108],
        azure: [76, 78, 82, 86, 90, 96, 101],
    },
    'n2-standard-4': {
        gcp: [110, 115, 120, 125, 130, 135, 140],
        aws: [130, 138, 145, 150, 155, 160, 165],
        azure: [125, 130, 135, 140, 145, 150, 158],
    },
    'c2-standard-8': {
        gcp: [250, 260, 270, 280, 290, 300, 310],
        aws: [280, 295, 305, 320, 335, 345, 355],
        azure: [270, 285, 295, 305, 320, 330, 342],
    },
    'g4dn.xlarge': {
        gcp: [180, 185, 190, 195, 200, 205, 210],
        aws: [220, 230, 240, 245, 250, 255, 260],
        azure: [210, 220, 230, 235, 240, 242, 245],
    },
};

const VM_OPTIONS = Object.keys(VM_COST_DATA).map(vm => ({
    label: vm,
    value: vm,
})) as { label: string; value: VmType }[];

/* ---------------- SCREEN ---------------- */
export default function EstimationScreen() {
    const [vmType, setVmType] = useState<VmType>('e2-standard-2');
    const [provider, setProvider] = useState<Provider>('gcp');

    const prices = VM_COST_DATA[vmType][provider];
    const monthlyCost = prices[prices.length - 1];

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Cost Estimation</Text>
            <Text style={styles.subtitle}>
                Compare VM pricing across cloud providers
            </Text>

            {/* VM SELECTOR */}
            <Dropdown
                label="Select VM Type"
                mode="outlined"
                options={VM_OPTIONS}
                value={vmType}
                onSelect={(value) => setVmType(value as VmType)}
            />

            {/* PROVIDER SELECTOR */}
            <SegmentedButtons
                value={provider}
                onValueChange={value => setProvider(value as Provider)}
                buttons={[
                    { value: 'gcp', label: 'GCP' },
                    { value: 'aws', label: 'AWS' },
                    { value: 'azure', label: 'Azure' },
                ]}
                style={{ marginVertical: 12 }}
            />

            {/* COST SUMMARY */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.metricLabel}>Estimated Monthly Cost</Text>
                    <Text style={styles.metricValue}>₹ {monthlyCost}</Text>
                </Card.Content>
            </Card>

            {/* COST TREND */}
            <Card style={styles.card}>
                <Card.Content>
                    <LineChart
                        data={{
                            labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
                            datasets: [{ data: prices }],
                        }}
                        width={screenWidth - 48}
                        height={220}
                        yAxisLabel="₹"
                        chartConfig={chartConfig}
                    />
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

/* ---------------- STYLES ---------------- */
const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: () => '#2563eb',
    labelColor: () => '#000000',
};

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000000',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 12,
        color: '#000000',
    },
    card: {
        marginBottom: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    metricLabel: {
        fontSize: 14,
        color: '#000000',
    },
    metricValue: {
        fontSize: 26,
        fontWeight: '700',
        marginVertical: 6,
        color: '#000000',
    },
});
