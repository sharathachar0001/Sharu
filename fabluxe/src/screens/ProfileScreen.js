import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import { logout } from '../utils/authService';

export default function ProfileScreen({ user, onLogout }) {
  function handleLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await logout();
          onLogout();
        },
      },
    ]);
  }

  const items = [
    { icon: 'person-outline', label: 'Name', value: user?.name },
    { icon: 'mail-outline', label: 'Email', value: user?.email },
    { icon: 'shield-checkmark-outline', label: 'Role', value: user?.role?.toUpperCase() },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
      </View>

      <View style={styles.card}>
        {items.map(it => (
          <View key={it.label} style={styles.row}>
            <Ionicons name={it.icon} size={20} color={COLORS.accent} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={styles.rowLabel}>{it.label}</Text>
              <Text style={styles.rowValue}>{it.value}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About FABLUXE App</Text>
        <Text style={styles.about}>
          Visitor Management System for FABLUXE Interior Home Solutions.{'\n'}
          Track visitors, manage follow-ups, and analyze showroom performance.
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary, padding: SPACING.xl,
    alignItems: 'center', paddingBottom: SPACING.xl,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.accent,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: COLORS.primary },
  name: { color: '#fff', fontSize: 22, fontWeight: '700' },
  role: { color: COLORS.accentLight, fontSize: 13, letterSpacing: 2, marginTop: 4 },
  card: {
    backgroundColor: COLORS.surface, margin: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.md, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowLabel: { fontSize: 12, color: COLORS.textLight },
  rowValue: { fontSize: 15, color: COLORS.text, fontWeight: '500', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  about: { fontSize: 13, color: COLORS.textLight, lineHeight: 20 },
  logoutBtn: {
    backgroundColor: COLORS.error, margin: SPACING.lg, borderRadius: RADIUS.md,
    padding: SPACING.md, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: SPACING.sm,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
