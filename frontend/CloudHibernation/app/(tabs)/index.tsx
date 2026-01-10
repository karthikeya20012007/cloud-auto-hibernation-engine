import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { logout } from '../../services/auth';
import { fetchResources } from '../../services/api';

import SummaryHeader from '../../components/SummaryHeader';
import PolicyBanner from '../../components/PolicyBanner';
import ResourceCard from '../../components/ResourceCard';
import type { Resource } from '../../types/resource';

export default function DashboardScreen() {
  const router = useRouter();

  const [resources, setResources] = useState<Resource[]>([]);
  const [policy, setPolicy] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchResources()
      .then((data) => {
        setResources(data.resources);
        setPolicy(data.policy);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    router.replace('/auth');
  }

  // ✅ AFTER all hooks
  if (loading) {
    return <Text style={{ padding: 16 }}>Loading dashboard...</Text>;
  }

  const filteredResources = resources.filter((r) =>
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView
      style={[
        styles.container, // ✅ SAFE AREA
      ]}
    >
      {/* 🔝 HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.welcome}>Welcome back Karthikeya 👋</Text>
          <Button compact onPress={handleLogout}>
            Logout
          </Button>
        </View>

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

      {/* 📊 SUMMARY */}
      <SummaryHeader
        total={resources.length}
        warnings={resources.filter(r => r.policy_status === 'warning').length}
        stopped={resources.filter(r => r.policy_status === 'auto-stopped').length}
      />

      {/* 📜 POLICY */}
      {policy && <PolicyBanner policy={policy} />}

      {/* 🖥️ RESOURCES */}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
