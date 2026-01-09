import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, Chip, Divider } from 'react-native-paper';
import { fetchResources } from '../../services/api';


type Resource = {
  id: string;
  type: string;
  cpu: number;
  idle_minutes: number;
  state: string;
  policy_status: 'healthy' | 'warning' | 'auto-stopped';
};

export default function DashboardScreen() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources()
      .then((data) => {
        setResources(data.resources);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);


  if (loading) {
    return <Text style={{ padding: 16 }}>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Compute Resources" />
        <Card.Content>
          {resources.map((r) => (
            <View key={r.id}>
              <View style={styles.row}>
                <Text style={styles.name}>{r.id}</Text>

                <Chip
                  style={
                    r.policy_status === 'auto-stopped'
                      ? styles.stopped
                      : r.policy_status === 'warning'
                        ? styles.warning
                        : styles.healthy
                  }
                >
                  {r.policy_status.toUpperCase()}
                </Chip>
              </View>

              <Text>Type: {r.type}</Text>
              <Text>CPU: {r.cpu}%</Text>
              <Text>Idle Time: {r.idle_minutes} minutes</Text>
              <Text>State: {r.state}</Text>

              <Divider style={{ marginVertical: 8 }} />
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#f6f8fc',
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    marginRight: 8,
  },
  healthy: {
    backgroundColor: '#e6f4ea',
  },
  warning: {
    backgroundColor: '#fef7e0',
  },
  stopped: {
    backgroundColor: '#fce8e6',
  },
});
