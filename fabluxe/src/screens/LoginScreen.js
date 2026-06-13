import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import { login } from '../utils/authService';

const DOMAIN = '@fabluxe.com';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Toggle: true = short login (name@fabluxe.com), false = full email
  const [useFabluxeLogin, setUseFabluxeLogin] = useState(true);

  function getEmail() {
    const u = username.trim().toLowerCase();
    if (!useFabluxeLogin) return u; // full email entered
    if (u.includes('@')) return u;  // already full email
    return u + DOMAIN;
  }

  async function handleLogin() {
    if (!username.trim() || !password) {
      return Alert.alert('Required', 'Please enter your username and password.');
    }
    setLoading(true);
    try {
      const user = await login(getEmail(), password);
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
      {/* Background circles */}
      <View style={[styles.circle, { width: 300, height: 300, top: -80, left: -80, opacity: 0.05 }]} />
      <View style={[styles.circle, { width: 200, height: 200, bottom: 80, right: -60, opacity: 0.07 }]} />

      <View style={styles.card}>
        {/* Brand */}
        <Text style={styles.brand}>FABLUXE</Text>
        <Text style={styles.tagline}>INTERIOR HOME SOLUTIONS</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Visitor Management System</Text>

        {/* Login mode toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, useFabluxeLogin && styles.toggleBtnActive]}
            onPress={() => setUseFabluxeLogin(true)}
          >
            <Text style={[styles.toggleText, useFabluxeLogin && styles.toggleTextActive]}>
              Staff Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !useFabluxeLogin && styles.toggleBtnActive]}
            onPress={() => setUseFabluxeLogin(false)}
          >
            <Text style={[styles.toggleText, !useFabluxeLogin && styles.toggleTextActive]}>
              Admin (Full Email)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Username field */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>
            {useFabluxeLogin ? 'Staff Username' : 'Email Address'}
          </Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={useFabluxeLogin ? 'e.g.  sharath' : 'admin@fabluxe.com'}
              placeholderTextColor={COLORS.textLight}
              value={username}
              onChangeText={setUsername}
              keyboardType={useFabluxeLogin ? 'default' : 'email-address'}
              autoCapitalize="none"
              returnKeyType="next"
            />
            {useFabluxeLogin && username.length > 0 && (
              <Text style={styles.domainSuffix}>{DOMAIN}</Text>
            )}
          </View>
          {useFabluxeLogin && username.trim() !== '' && (
            <Text style={styles.emailPreview}>
              Logging in as: {getEmail()}
            </Text>
          )}
        </View>

        {/* Password field */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In button */}
        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={20} color={COLORS.primary} />
              <Text style={styles.btnText}>Sign In</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Staff login hint */}
        {useFabluxeLogin && (
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={14} color={COLORS.textLight} />
            <Text style={styles.hintText}>
              Staff accounts: <Text style={{ color: COLORS.accent }}>name@fabluxe.com</Text>
              {'\n'}Contact your admin if you need access.
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.footer}>FABLUXE  ·  Visitor Management System  ·  v1.0</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.primary,
    justifyContent: 'center', padding: SPACING.lg,
  },
  circle: {
    position: 'absolute', backgroundColor: COLORS.accent, borderRadius: 999,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 28,
    padding: SPACING.xl, paddingBottom: SPACING.lg,
    // Gold top border
    borderTopWidth: 3, borderTopColor: COLORS.accent,
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20,
  },
  brand: {
    fontSize: 36, fontWeight: '800', color: COLORS.accent,
    letterSpacing: 8, textAlign: 'center',
  },
  tagline: {
    fontSize: 10, color: COLORS.textLight, letterSpacing: 2.5,
    textAlign: 'center', marginTop: 4,
  },
  divider: {
    width: 48, height: 2, backgroundColor: COLORS.accent,
    alignSelf: 'center', marginVertical: SPACING.md, borderRadius: 2,
  },
  subtitle: {
    fontSize: 14, color: COLORS.text, textAlign: 'center',
    fontWeight: '600', marginBottom: SPACING.lg,
  },
  toggleRow: {
    flexDirection: 'row', backgroundColor: COLORS.background,
    borderRadius: RADIUS.md, padding: 3, marginBottom: SPACING.lg,
  },
  toggleBtn: {
    flex: 1, padding: SPACING.sm, borderRadius: RADIUS.sm - 2, alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: COLORS.primary },
  toggleText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  toggleTextActive: { color: COLORS.accent },
  fieldWrap: { marginBottom: SPACING.md },
  fieldLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textLight,
    letterSpacing: 0.5, marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    backgroundColor: COLORS.background, paddingHorizontal: SPACING.sm,
  },
  inputIcon: { marginRight: SPACING.xs },
  input: {
    flex: 1, padding: SPACING.sm + 2, color: COLORS.text, fontSize: 15,
  },
  domainSuffix: {
    fontSize: 14, color: COLORS.accent, fontWeight: '600',
    paddingRight: SPACING.sm,
  },
  eyeBtn: { padding: SPACING.sm },
  emailPreview: {
    fontSize: 11, color: COLORS.accent, marginTop: 4,
    fontStyle: 'italic', marginLeft: 4,
  },
  btn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.md,
    padding: SPACING.md, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.sm,
    elevation: 4, shadowColor: COLORS.accent, shadowOpacity: 0.4, shadowRadius: 8,
  },
  btnText: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  hintBox: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: COLORS.background, borderRadius: RADIUS.sm,
    padding: SPACING.sm, marginTop: SPACING.md,
  },
  hintText: { flex: 1, fontSize: 11, color: COLORS.textLight, lineHeight: 16 },
  footer: {
    color: 'rgba(255,255,255,0.3)', textAlign: 'center',
    fontSize: 10, letterSpacing: 1, marginTop: SPACING.lg,
  },
});
