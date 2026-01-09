import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { fetchResources } from '../../services/api';
import ResourceCard from '../../components/ResourceCard';

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

export default function ExploreScreen() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // 🔁 SINGLE source of truth for fetching
  function loadResources(silent = false) {
    if (!silent) setLoading(true);

    fetchResources()
      .then((data) => setResources(data.resources))
      .catch(console.error)
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }

  // Initial load ONLY ONCE
  useEffect(() => {
    loadResources();
  }, []);

  if (loading) {
    return <Text style={{ padding: 16 }}>Loading resources...</Text>;
  }

  const filteredResources = resources.filter((r) =>
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <TextInput
        mode="outlined"
        placeholder="Search VM or resource name..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* Resource List */}
      {filteredResources.length === 0 ? (
        <Text style={styles.empty}>No matching resources found.</Text>
      ) : (
        filteredResources.map((r) => (
          <ResourceCard
            key={r.id}
            r={r}
            onStopped={loadResources} // ✅ THIS IS CRITICAL
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
  search: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    color: '#475569',
  },
});
