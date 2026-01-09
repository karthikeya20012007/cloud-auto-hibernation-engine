import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    text: '#000000',
    onSurface: '#000000',
    onBackground: '#000000',
    primary: '#1d4ed8',
    background: '#f8fafc',
    surface: '#ffffff',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#f8fafc' }}
        edges={['top']}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </SafeAreaView>
    </PaperProvider>
  );
}
