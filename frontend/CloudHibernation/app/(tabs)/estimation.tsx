import { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Card, SegmentedButtons, TextInput } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { Dropdown } from 'react-native-paper-dropdown';

const screenWidth = Dimensions.get('window').width;

/* ---------------- TYPES ---------------- */
type ResourceType = 'vm';

type VmType =
    | 'e2-standard-2'
    | 'n2-standard-4'
    | 'c2-standard-8'
    | 'g4dn.xlarge';

type Provider = 'gcp' | 'aws' | 'azure';

/* ---------------- MOCK HOURLY COST DATA (₹ / hour) ---------------- */
const HOURLY_COST: Record<VmType, Record<Provider, number>> = {
    'e2-standard-2': {
        gcp: 3,
        aws: 3.5,
        azure: 3.2,
    },
    'n2-standard-4': {
        gcp: 5,
        aws: 6,
        azure: 5.8,
    },
    'c2-standard-8': {
        gcp: 10,
        aws: 12,
        azure: 11.5,
    },
    'g4dn.xlarge': {
        gcp: 8,
        aws: 10,
        azure: 9.5,
    },
};

/* ---------------- DROPDOWN OPTIONS ---------------- */
const RESOURCE_OPTIONS = [
    { label: 'Virtual Machine', value: 'vm' },
];

const VM_OPTIONS = Object.keys(HOURLY_COST).map(vm => ({
    label: vm,
    value: vm,
})) as { label: string; value: VmType }[];

/* ---------------- SCREEN ---------------- */
export default function EstimationScreen() {
    const [resourceType, setResourceType] = useState<ResourceType>('vm');
    const [vmType, setVmType] = useState<VmType>('e2-standard-2');
    const [hoursPerDay, setHoursPerDay] = useState<string>('3');

    const daysPerMonth = 30;
    const hours = Math.min(Math.max(Number(hoursPerDay) || 0, 0), 24);

    const calculateMonthlyCost = (provider: Provider) => {
        const hourly = HOURLY_COST[vmType][provider];
        return Math.round(hourly * hours * daysPerMonth);
    };

    const gcpCost = calculateMonthlyCost('gcp');
    const awsCost = calculateMonthlyCost('aws');
    const azureCost = calculateMonthlyCost('azure');

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Cost Estimation</Text>
            <Text style={styles.subtitle}>
                Estimate monthly cloud cost based on declared usage
            </Text>

            {/* RESOURCE TYPE */}
            <Dropdown
                label="Compute Resource Type"
                mode="outlined"
                options={RESOURCE_OPTIONS}
                value={resourceType}
                onSelect={(value) => setResourceType(value as ResourceType)}
            />

            {/* VM TYPE */}
            <View style={{ marginTop: 15 }}>
                <Dropdown
                    label="Select VM Type"
                    mode="outlined"
                    options={VM_OPTIONS}
                    value={vmType}
                    onSelect={(value) => setVmType(value as VmType)}
                />
            </View>


            {/* USAGE INPUT */}
            <TextInput
                label="Expected Usage (hours per day)"
                mode="outlined"
                keyboardType="numeric"
                value={hoursPerDay}
                onChangeText={setHoursPerDay}
                style={{ marginTop: 12 }}
                right={<TextInput.Affix text="/24 hrs" />}
            />

            {/* COST SUMMARY */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.metricLabel}>Estimated Monthly Cost</Text>

                    <View style={styles.costRow}>
                        <Text style={styles.provider}>GCP</Text>
                        <Text style={styles.cost}>₹ {gcpCost}</Text>
                    </View>

                    <View style={styles.costRow}>
                        <Text style={styles.provider}>AWS</Text>
                        <Text style={styles.cost}>₹ {awsCost}</Text>
                    </View>

                    <View style={styles.costRow}>
                        <Text style={styles.provider}>Azure</Text>
                        <Text style={styles.cost}>₹ {azureCost}</Text>
                    </View>
                </Card.Content>
            </Card>

            {/* COST COMPARISON CHART */}
            <Card style={styles.card}>
                <Card.Content>
                    <LineChart
                        data={{
                            labels: ['GCP', 'AWS', 'Azure'],
                            datasets: [
                                {
                                    data: [gcpCost, awsCost, azureCost],
                                },
                            ],
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
        marginTop: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    metricLabel: {
        fontSize: 14,
        marginBottom: 8,
        color: '#000000',
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    provider: {
        fontSize: 14,
        color: '#000000',
    },
    cost: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
});
