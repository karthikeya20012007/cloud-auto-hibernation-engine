import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import CloudAssistant from '../../components/CloudAssistant';
import { IconButton, Modal, Portal } from 'react-native-paper';
import { useNavigation } from 'expo-router';
import PolicyBanner from '../../components/PolicyBanner';



import { fetchResources } from '../../services/api';
import SummaryHeader from '../../components/SummaryHeader';
import ResourceCard from '../../components/ResourceCard';

export default function DashboardScreen() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<any>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);


  const navigation = useNavigation();

  useEffect(() => {
    fetchResources()
      .then((data) => {
        setResources(data.resources);
        setPolicy(data.policy);
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="robot"
          onPress={() => setAssistantOpen(true)}
        />
      ),
    });
  }, [navigation]);


  if (loading) return <Text style={{ padding: 16 }}>Loading...</Text>;

  const warnings = resources.filter(r => r.policy_status === 'warning').length;
  const stopped = resources.filter(r => r.policy_status === 'auto-stopped').length;

  return (
    <>
      {/* Main Dashboard */}
      <ScrollView style={styles.container}>
        {policy && <PolicyBanner policy={policy} />}
        <SummaryHeader
          total={resources.length}
          warnings={resources.filter(r => r.policy_status === 'warning').length}
          stopped={resources.filter(r => r.policy_status === 'auto-stopped').length}
        />

        {resources.map((r) => (
          <ResourceCard key={r.id} r={r} />
        ))}
      </ScrollView>

      {/* Chatbot + Floating Button */}
    </>
  );

}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24, // slightly lifted, avoids nav overlap
  },

});
