import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../config/theme';
import { staffLogin, adminLogin } from '../utils/authService';

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('staff');
  const [staffName, setStaffName] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedName, setFocusedName] = useState(false);
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPass, setFocusedPass] = useState(false);

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
      <View style={styles.glowTL} pointerEvents="none" />
      <View style={styles.glowBR} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brandSection}>
          <Text style={styles.brand}>FABLUXE</Text>
          <View style={styles.goldLine} />
          <Text style={styles.tagline}>INTERIOR HOME SOLUTIONS</Text>
        </View>

        <View style={styles.card}>
          {/* Mode Toggle */}
          <View style={styles.toggle}>
            {['staff', 'admin'].map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
                onPress={() => setMode(m)}
              >
                <Ionicons
                  name={m === 'staff' ? 'person-outline' : 'shield-outline'}
                  size={14}
                  color={mode === m ? colors.primary : colors.outlineVariant}
                />
                <Text style={[styles.toggleLabel, mode === m && styles.toggleLabelActive]}>
                  {m === 'staff' ? 'Staff Login' : 'Admin Login'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'staff' ? (
            <>
              <Text style={styles.sectionLabel}>YOUR NAME</Text>
              <View style={[styles.underlineInput, focusedName && styles.underlineInputFocused]}>
                <Ionicons name="person-outline" size={16} color={focusedName ? colors.primary : colors.outlineVariant} />
                <TextInput
                  style={styles.inputText}
                  placeholder="e.g. Sharath"
                  placeholderTextColor={colors.outlineVariant}
                  value={staffName}
                  onChangeText={setStaffName}
                  autoCapitalize="words"
                  onFocus={() => setFocusedName(true)}
                  onBlur={() => setFocusedName(false)}
                />
              </View>

              <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>4-DIGIT PIN</Text>
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

              <TouchableOpacity onPress={handleStaffLogin} disabled={loading} style={styles.btnWrapper}>
                <LinearGradient colors={['#e9c176', '#c9952e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                  {loading ? <ActivityIndicator color={colors.onPrimary} /> : (
                    <>
                      <Ionicons name="log-in-outline" size={18} color={colors.onPrimary} />
                      <Text style={styles.btnText}>SECURE ACCESS</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.hint}>
                <Ionicons name="information-circle-outline" size={13} color={colors.outlineVariant} />
                <Text style={styles.hintText}>Your name and PIN are set by your admin. Contact admin if you can't log in.</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sectionLabel}>EMAIL ADDRESS</Text>
              <View style={[styles.underlineInput, focusedEmail && styles.underlineInputFocused]}>
                <Ionicons name="mail-outline" size={16} color={focusedEmail ? colors.primary : colors.outlineVariant} />
                <TextInput
                  style={styles.inputText}
                  placeholder="admin@gmail.com"
                  placeholderTextColor={colors.outlineVariant}
                  value={adminEmail}
                  onChangeText={setAdminEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedEmail(true)}
                  onBlur={() => setFocusedEmail(false)}
                />
              </View>

              <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>PASSWORD</Text>
              <View style={[styles.underlineInput, focusedPass && styles.underlineInputFocused]}>
                <Ionicons name="lock-closed-outline" size={16} color={focusedPass ? colors.primary : colors.outlineVariant} />
                <TextInput
                  style={[styles.inputText, { flex: 1 }]}
                  placeholder="Enter password"
                  placeholderTextColor={colors.outlineVariant}
                  value={adminPass}
                  onChangeText={setAdminPass}
                  secureTextEntry={!showPass}
                  onSubmitEditing={handleAdminLogin}
                  onFocus={() => setFocusedPass(true)}
                  onBlur={() => setFocusedPass(false)}
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.outlineVariant} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleAdminLogin} disabled={loading} style={[styles.btnWrapper, { marginTop: spacing.xl }]}>
                <LinearGradient colors={['#e9c176', '#c9952e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                  {loading ? <ActivityIndicator color={colors.onPrimary} /> : (
                    <>
                      <Ionicons name="shield-checkmark-outline" size={18} color={colors.onPrimary} />
                      <Text style={styles.btnText}>ADMIN SIGN IN</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.footer}>FABLUXE Visitor Management  ·  v1.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  glowTL: {
    position: 'absolute', top: -100, left: -100,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(233,193,118,0.06)',
  },
  glowBR: {
    position: 'absolute', bottom: -80, right: -80,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(233,193,118,0.04)',
  },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  brandSection: { alignItems: 'center', marginBottom: spacing.xl },
  brand: {
    fontFamily: fonts.playfair.bold, fontSize: 42,
    color: colors.primary, letterSpacing: 10,
  },
  goldLine: {
    width: 50, height: 1.5, backgroundColor: colors.primary,
    marginVertical: spacing.md, opacity: 0.6,
  },
  tagline: {
    fontFamily: fonts.manrope.semiBold, fontSize: 10,
    color: colors.onSurfaceVariant, letterSpacing: 3,
  },
  card: {
    backgroundColor: colors.glassBackground,
    borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: radius.xl, padding: spacing.xl,
  },
  toggle: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderRadius: radius.md, padding: 3, marginBottom: spacing.xl,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: spacing.sm, borderRadius: radius.sm,
  },
  toggleBtnActive: { backgroundColor: colors.surfaceContainer },
  toggleLabel: { fontFamily: fonts.manrope.semiBold, fontSize: 12, color: colors.outlineVariant },
  toggleLabelActive: { color: colors.primary },
  sectionLabel: {
    fontFamily: fonts.manrope.semiBold, fontSize: 10,
    color: colors.onSurfaceVariant, letterSpacing: 2, marginBottom: spacing.sm,
  },
  underlineInput: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.outlineVariant,
    paddingBottom: spacing.sm,
  },
  underlineInputFocused: { borderBottomColor: colors.primary },
  inputText: {
    fontFamily: fonts.manrope.regular, fontSize: 15,
    color: colors.onSurface, flex: 1, paddingVertical: 4,
  },
  pinRow: {
    flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.xl,
  },
  pinBox: {
    width: 60, height: 68, borderWidth: 1.5, borderColor: colors.outlineVariant,
    borderRadius: radius.md, textAlign: 'center', fontSize: 28, fontWeight: '700',
    color: colors.onSurface, backgroundColor: colors.surface,
  },
  pinBoxFilled: {
    borderColor: colors.primary, backgroundColor: 'rgba(233,193,118,0.08)',
    color: colors.primary,
  },
  btnWrapper: { borderRadius: radius.full, overflow: 'hidden' },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: 16, borderRadius: radius.full,
  },
  btnText: {
    fontFamily: fonts.manrope.extraBold, fontSize: 13,
    color: colors.onPrimary, letterSpacing: 3,
  },
  hint: {
    flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: spacing.lg,
  },
  hintText: {
    fontFamily: fonts.manrope.regular, fontSize: 11,
    color: colors.outlineVariant, flex: 1, lineHeight: 16,
  },
  footer: {
    fontFamily: fonts.manrope.regular, fontSize: 10,
    color: 'rgba(209,197,180,0.3)', textAlign: 'center',
    letterSpacing: 1, marginTop: spacing.xl,
  },
});
