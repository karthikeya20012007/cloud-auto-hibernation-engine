import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets(); // ✅ ONE PLACE

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="speedometer-outline" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="assistant"
          options={{
            title: 'Assistant',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-ellipses-outline" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="estimation"
          options={{
            title: 'Estimation',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cash-outline" color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
});
