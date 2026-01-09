import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, Chip, Divider } from 'react-native-paper';
import { fetchVMs } from '@/services/api';

type VM = {
  id: string;
  state: string;
  cpu: number;
};

export default function ExploreScreen() {
  const [vms, setVMs] = useState<VM[]>([]);

  useEffect(() => {
    fetchVMs().then(setVMs);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title title="All VM Instances" />
        <Card.Content>
          {vms.map((vm) => (
            <View key={vm.id}>
              <View style={styles.row}>
                <Text>{vm.id}</Text>
                <Chip>{vm.state.toUpperCase()}</Chip>
                <Text>{vm.cpu}% CPU</Text>
              </View>
              <Divider />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
