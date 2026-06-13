import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import { staffLogin, adminLogin } from '../utils/authService';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('staff'); // 'staff' | 'admin'

  // Staff fields
  const [staffName, setStaffName] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];

  // Admin fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading] = useState(false);

  function handlePinChange(val, index) {
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const next = [...pin];
    next[index] = cleaned;
    setPin(next);
    if (cleaned && index < 3) pinRefs[index + 1].current?.focus();
    if (!cleaned && index > 0) pinRefs[index - 1].current?.focus();
  }

  async function handleStaffLogin() {
    const pinStr = pin.join('');
    if (!staffName.trim()) return Alert.alert('Required', 'Please enter your name.');
    if (pinStr.length !== 4) return Alert.alert('Required', 'Please enter your 4-digit PIN.');
    setLoading(true);
    try {
      const user = await staffLogin(staffName.trim(), pinStr);
      onLogin(user);
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminLogin() {
    if (!adminEmail.trim() || !adminPass) return Alert.alert('Required', 'Enter email and password.');
    setLoading(true);
    try {
      const user = await adminLogin(adminEmail.trim(), adminPass);
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
      {/* BG decorations */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.card}>
        {/* Brand */}
        <Text style={styles.brand}>FABLUXE</Text>
        <Text style={styles.tagline}>INTERIOR HOME SOLUTIONS</Text>
        <View style={styles.goldLine} />

        {/* Mode toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'staff' && styles.toggleActive]}
            onPress={() => setMode('staff')}
          >
            <Ionicons
              name="person-outline" size={14}
              color={mode === 'staff' ? COLORS.accent : COLORS.textLight}
            />
            <Text style={[styles.toggleLabel, mode === 'staff' && styles.toggleLabelActive]}>
              Staff Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'admin' && styles.toggleActive]}
            onPress={() => setMode('admin')}
          >
            <Ionicons
              name="shield-outline" size={14}
              color={mode === 'admin' ? COLORS.accent : COLORS.textLight}
            />
            <Text style={[styles.toggleLabel, mode === 'admin' && styles.toggleLabelActive]}>
              Admin Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── STAFF LOGIN ── */}
        {mode === 'staff' ? (
          <>
            <Text style={styles.sectionLabel}>YOUR NAME</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                placeholder="e.g.  Sharath"
                placeholderTextColor={COLORS.textLight}
                value={staffName}
                onChangeText={setStaffName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>4-DIGIT PIN</Text>
            <View style={styles.pinRow}>
              {pin.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={pinRefs[i]}
                  style={[styles.pinBox, digit && styles.pinBoxFilled]}
                  value={digit}
                  onChangeText={v => handlePinChange(v, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  secureTextEntry
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={handleStaffLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={COLORS.primary} />
                : <><Ionicons name="log-in-outline" size={20} color={COLORS.primary} /><Text style={styles.btnText}>Sign In</Text></>
              }
            </TouchableOpacity>

            <View style={styles.hint}>
              <Ionicons name="information-circle-outline" size={14} color={COLORS.textLight} />
              <Text style={styles.hintText}>
                Your name and PIN are set by your admin.{'\n'}
                Contact admin if you can't log in.
              </Text>
            </View>
          </>
        ) : (
          /* ── ADMIN LOGIN ── */
          <>
            <Text style={styles.sectionLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                placeholder="admin@gmail.com"
                placeholderTextColor={COLORS.textLight}
                value={adminEmail}
                onChangeText={setAdminEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textLight} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textLight}
                value={adminPass}
                onChangeText={setAdminPass}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleAdminLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18} color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={handleAdminLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={COLORS.primary} />
                : <><Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} /><Text style={styles.btnText}>Admin Sign In</Text></>
              }
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={styles.footer}>FABLUXE Visitor Management  ·  v1.0</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.primary,
    justifyContent: 'center', padding: SPACING.lg,
  },
  circle1: {
    position: 'absolute', width: 280, height: 280,
    borderRadius: 140, backgroundColor: COLORS.accent,
    top: -100, left: -100, opacity: 0.05,
  },
  circle2: {
    position: 'absolute', width: 180, height: 180,
    borderRadius: 90, backgroundColor: COLORS.accent,
    bottom: 60, right: -60, opacity: 0.07,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 28,
    padding: SPACING.xl, borderTopWidth: 3, borderTopColor: COLORS.accent,
    elevation: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20,
  },
  brand: {
    fontSize: 38, fontWeight: '800', color: COLORS.accent,
    letterSpacing: 8, textAlign: 'center',
  },
  tagline: {
    fontSize: 10, color: COLORS.textLight, letterSpacing: 2.5,
    textAlign: 'center', marginTop: 4,
  },
  goldLine: {
    width: 40, height: 2, backgroundColor: COLORS.accent,
    alignSelf: 'center', borderRadius: 2, marginVertical: SPACING.md,
  },
  toggle: {
    flexDirection: 'row', backgroundColor: COLORS.background,
    borderRadius: RADIUS.md, padding: 3, marginBottom: SPACING.lg,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: SPACING.sm, borderRadius: RADIUS.sm - 2,
  },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  toggleLabelActive: { color: COLORS.accent },
  sectionLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textLight,
    letterSpacing: 1.5, marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    backgroundColor: COLORS.background, paddingHorizontal: SPACING.md, gap: SPACING.sm,
  },
  input: {
    flex: 1, paddingVertical: SPACING.md,
    color: COLORS.text, fontSize: 15,
  },
  pinRow: {
    flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, marginBottom: SPACING.lg,
  },
  pinBox: {
    width: 56, height: 64, borderWidth: 2, borderColor: COLORS.border,
    borderRadius: RADIUS.md, textAlign: 'center', fontSize: 28, fontWeight: '700',
    color: COLORS.text, backgroundColor: COLORS.background,
  },
  pinBoxFilled: {
    borderColor: COLORS.accent, backgroundColor: 'rgba(201,168,76,0.08)',
  },
  btn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.md,
    padding: SPACING.md, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.sm,
    elevation: 4, shadowColor: COLORS.accent, shadowOpacity: 0.4, shadowRadius: 8,
  },
  btnText: { color: COLORS.primary, fontWeight: '800', fontSize: 16 },
  hint: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: COLORS.background, borderRadius: RADIUS.sm,
    padding: SPACING.sm, marginTop: SPACING.md,
  },
  hintText: { flex: 1, fontSize: 11, color: COLORS.textLight, lineHeight: 18 },
  footer: {
    color: 'rgba(255,255,255,0.3)', textAlign: 'center',
    fontSize: 10, letterSpacing: 1, marginTop: SPACING.lg,
  },
});
