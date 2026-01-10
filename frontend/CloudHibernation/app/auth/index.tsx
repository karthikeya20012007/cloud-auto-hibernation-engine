import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { login } from '../../services/auth';

export default function AuthScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit() {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    // 🔐 DEMO AUTH (replace later with backend)
    login();

    // ✅ Navigate AFTER user action (safe)
    router.replace('/');

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cloud Hibernation</Text>

      <Text style={styles.subtitle}>
        {mode === 'login'
          ? 'Login to manage your cloud resources'
          : 'Create a new account'}
      </Text>

      {/* LOGIN / SIGNUP TOGGLE */}
      <SegmentedButtons
        value={mode}
        onValueChange={(v) => setMode(v as 'login' | 'signup')}
        buttons={[
          { value: 'login', label: 'Login' },
          { value: 'signup', label: 'Sign Up' },
        ]}
        style={{ marginBottom: 20 }}
      />

      {/* EMAIL */}
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      {/* PASSWORD */}
      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* CONFIRM PASSWORD */}
      {mode === 'signup' && (
        <TextInput
          label="Confirm Password"
          mode="outlined"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />
      )}

      {/* ACTION BUTTON */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
        buttonColor="#111827"
      >
        {mode === 'login' ? 'Login' : 'Sign Up'}
      </Button>

      <Text style={styles.footer}>
        {mode === 'login'
          ? 'New user? Switch to Sign Up'
          : 'Already have an account? Switch to Login'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    color: '#0f172a',
  },
  subtitle: {
    textAlign: 'center',
    color: '#475569',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 8,
    borderRadius: 6,
    paddingVertical: 6,
  },
  footer: {
    marginTop: 16,
    textAlign: 'center',
    color: '#64748b',
    fontSize: 12,
  },
});
