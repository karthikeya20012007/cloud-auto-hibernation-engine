import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="speedometer-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* Assistant */}
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-ellipses-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* Cost Estimation */}
      <Tabs.Screen
        name="estimation"
        options={{
          title: 'Estimation',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="cash-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
