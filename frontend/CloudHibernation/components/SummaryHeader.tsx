import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

type Props = {
    total: number;
    warnings: number;
    stopped: number;
};

export default function SummaryHeader({ total, warnings, stopped }: Props) {
    return (
        <View style={styles.row}>
            <Metric title="Total Resources" value={total} />
            <Metric title="Warnings" value={warnings} />
            <Metric title="Auto-Stopped" value={stopped} />
        </View>
    );
}

function Metric({ title, value }: { title: string; value: number }) {
    return (
        <Card style={styles.card}>
            <Card.Content>
                <Text variant="labelMedium">{title}</Text>
                <Text variant="headlineMedium">{value}</Text>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    card: {
        flex: 1,
    },
});
