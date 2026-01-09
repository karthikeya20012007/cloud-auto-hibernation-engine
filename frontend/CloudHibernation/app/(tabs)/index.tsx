import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { fetchResources } from '../../services/api';
import SummaryHeader from '../../components/SummaryHeader';
import PolicyBanner from '../../components/PolicyBanner';
import ResourceCard from '../../components/ResourceCard';

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


export default function DashboardScreen() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [policy, setPolicy] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  function loadResources(silent = false) {
    if (!silent) setLoading(true);

    fetchResources()
      .then((data) => {
        setResources(data.resources);
        setPolicy(data.policy);
      })
      .catch(console.error)
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }

  useEffect(() => {
    loadResources();
  }, []);

  if (loading) {
    return <Text style={{ padding: 16 }}>Loading dashboard...</Text>;
  }

  const filteredResources = resources.filter((r) =>
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      {/* 🔝 Welcome + Search */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back Karthikeya👋</Text>
        <Text style={styles.subtitle}>
          Monitor and control your compute resources
        </Text>

        <TextInput
          mode="outlined"
          placeholder="Search VM by name or tag..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />
      </View>

      {/* 📊 Summary */}
      <SummaryHeader
        total={resources.length}
        warnings={resources.filter(r => r.policy_status === 'warning').length}
        stopped={resources.filter(r => r.policy_status === 'auto-stopped').length}
      />

      {/* 📜 Policy */}
      {policy && <PolicyBanner policy={policy} />}

      {/* 🖥️ Resources */}
      {filteredResources.length === 0 ? (
        <Text style={styles.empty}>No matching resources found.</Text>
      ) : (
        filteredResources.map((r) => (
          <ResourceCard
            key={r.id}
            r={r}
            onStopped={(id) => {
              setResources(prev =>
                prev.map(vm =>
                  vm.id === id
                    ? { ...vm, state: 'stopped', policy_status: 'stopped' }
                    : vm
                )
              );
            }}
          />

        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  header: {
    marginBottom: 16,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  search: {
    backgroundColor: '#ffffff',
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    color: '#475569',
  },
});
