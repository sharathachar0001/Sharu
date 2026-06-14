import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import { addVisitor, VISIT_PURPOSES, VISIT_SOURCES } from '../utils/visitorService';
import { sendVisitorGreeting } from '../utils/greetingService';
import { ASK_BEFORE_SEND, ALLOW_ALL_STAFF } from '../config/greetingConfig';

export default function CheckInScreen({ navigation, user }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', purpose: '', source: '', notes: '',
  });
  const [loading, setLoading] = useState(false);

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); }

  function resetForm() {
    setForm({ name: '', phone: '', email: '', purpose: '', source: '', notes: '' });
  }

  async function sendGreeting(visitor) {
    try {
      await sendVisitorGreeting(visitor, user?.name || 'our team');
      Alert.alert('Greeting Sent ✨', `A welcome message was sent to ${visitor.name} on WhatsApp.`);
    } catch (e) {
      Alert.alert('Could Not Send', e.message);
    }
  }

  function offerGreeting(visitor) {
    // Send/Skip choice — keeps repeat walk-ins from being spammed.
    const canSend = ALLOW_ALL_STAFF || user?.role === 'manager' || user?.role === 'admin';
    if (!ASK_BEFORE_SEND || !canSend) {
      return Alert.alert('Checked In ✓', `${visitor.name} has been checked in!`, [
        { text: 'Add Another', onPress: resetForm },
        { text: 'Go to Dashboard', onPress: () => navigation.navigate('Dashboard') },
      ]);
    }
    Alert.alert(
      'Checked In ✓',
      `${visitor.name} has been checked in.\n\nSend a welcome greeting on WhatsApp?`,
      [
        { text: 'Skip', style: 'cancel', onPress: resetForm },
        {
          text: 'Send Greeting',
          onPress: async () => { await sendGreeting(visitor); resetForm(); },
        },
      ]
    );
  }

  async function handleSubmit() {
    if (!form.name.trim()) return Alert.alert('Required', 'Visitor name is required.');
    if (!form.phone.trim()) return Alert.alert('Required', 'Phone number is required.');
    if (!form.purpose) return Alert.alert('Required', 'Please select purpose of visit.');

    setLoading(true);
    try {
      const visitor = { ...form };
      await addVisitor({ ...visitor, addedBy: user?.name || 'Staff', addedByUid: user?.uid });
      offerGreeting(visitor);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerCard}>
        <Ionicons name="person-add" size={32} color={COLORS.accent} />
        <Text style={styles.headerTitle}>Visitor Check-In</Text>
        <Text style={styles.headerSub}>Register new showroom visitor</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visitor Details</Text>
        <InputField label="Full Name *" value={form.name} onChange={v => set('name', v)} placeholder="Enter visitor name" />
        <InputField label="Phone Number *" value={form.phone} onChange={v => set('phone', v)} placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />
        <InputField label="Email" value={form.email} onChange={v => set('email', v)} placeholder="email@example.com" keyboardType="email-address" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visit Information</Text>
        <Text style={styles.label}>Purpose of Visit *</Text>
        <ChipGroup options={VISIT_PURPOSES} selected={form.purpose} onSelect={v => set('purpose', v)} />
        <Text style={[styles.label, { marginTop: SPACING.md }]}>How Did They Hear About Us?</Text>
        <ChipGroup options={VISIT_SOURCES} selected={form.source} onSelect={v => set('source', v)} />
        <InputField label="Notes / Requirements" value={form.notes} onChange={v => set('notes', v)} placeholder="Any special notes or requirements..." multiline />
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color={COLORS.primary} /> : (
          <>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.submitText}>Check In Visitor</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function InputField({ label, value, onChange, placeholder, keyboardType, multiline }) {
  return (
    <View style={{ marginBottom: SPACING.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
      />
    </View>
  );
}

function ChipGroup({ options, selected, onSelect }) {
  return (
    <View style={styles.chipWrap}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, selected === opt && styles.chipSelected]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.chipText, selected === opt && styles.chipTextSelected]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: SPACING.sm },
  headerSub: { color: COLORS.accentLight, fontSize: 13, marginTop: 4 },
  section: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.sm,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textLight, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm,
    padding: SPACING.sm + 4, color: COLORS.text, fontSize: 15, backgroundColor: COLORS.background,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  chip: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 12, backgroundColor: COLORS.background,
  },
  chipSelected: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontSize: 13, color: COLORS.textLight },
  chipTextSelected: { color: COLORS.primary, fontWeight: '600' },
  submitBtn: {
    backgroundColor: COLORS.accent, margin: SPACING.md, borderRadius: RADIUS.md,
    padding: SPACING.md, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xl,
  },
  submitText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
});
