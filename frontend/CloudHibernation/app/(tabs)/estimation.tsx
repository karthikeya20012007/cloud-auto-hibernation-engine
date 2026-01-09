import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, DataTable } from 'react-native-paper';

const COST_DATA = [
    {
        id: 'finance-apac-payroll-batch-vm-09',
        gcp: 92,
        aws: 105,
        azure: 98,
    },
    {
        id: 'prod-eu-west1-api-gateway-vm-01',
        gcp: 140,
        aws: 162,
        azure: 151,
    },
];

export default function EstimationScreen() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>
                Monthly Cost Estimation (USD)
            </Text>

            <Card style={styles.card}>
                <Card.Content>
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title>VM</DataTable.Title>
                            <DataTable.Title numeric>GCP</DataTable.Title>
                            <DataTable.Title numeric>AWS</DataTable.Title>
                            <DataTable.Title numeric>Azure</DataTable.Title>
                        </DataTable.Header>

                        {COST_DATA.map((vm) => (
                            <DataTable.Row key={vm.id}>
                                <DataTable.Cell>{vm.id}</DataTable.Cell>
                                <DataTable.Cell numeric>${vm.gcp}</DataTable.Cell>
                                <DataTable.Cell numeric>${vm.aws}</DataTable.Cell>
                                <DataTable.Cell numeric>${vm.azure}</DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </DataTable>
                </Card.Content>
            </Card>

            <Text style={styles.note}>
                Estimates based on average on-demand pricing and
                current VM utilization.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: '#f8fafc',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        color: '#0f172a',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
    },
    note: {
        marginTop: 12,
        fontSize: 12,
        color: '#475569',
    },
});
