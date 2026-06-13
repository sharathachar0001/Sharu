import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import { login } from '../utils/authService';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Error', 'Please enter email and password.');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      onLogin(user);
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>FABLUXE</Text>
        <Text style={styles.tagline}>Interior Home Solutions</Text>
        <Text style={styles.subtitle}>Visitor Management System</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textLight,
    letterSpacing: 2,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontSize: 15,
  },
  btn: {
    backgroundColor: COLORS.accent,
    width: '100%',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  btnText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
});
