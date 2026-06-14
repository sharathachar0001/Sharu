import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Switch, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../config/theme';
import { getGreetingSettings, saveGreetingSettings } from '../utils/settingsService';
import { fillTemplate } from '../utils/greetingService';
import { EOD_CONFIG } from '../config/eodConfig';

const SAMPLE = { name: 'Arjun Mehta', phone: '9876543210' };

export default function GreetingSettingsScreen({ user }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGreetingSettings({ force: true }).then(setSettings);
  }, []);

  if (!settings) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const templateKeys = Object.keys(settings.messages);
  const activeMsg = settings.messages[settings.activeTemplate] || '';

  function setMessage(text) {
    setSettings(s => ({
      ...s,
      messages: { ...s.messages, [s.activeTemplate]: text },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveGreetingSettings(settings);
      Alert.alert('Saved ✨', 'Your greeting settings are now live for everyone.');
    } catch (e) {
      Alert.alert('Could Not Save', e.message);
    } finally {
      setSaving(false);
    }
  }

  const preview = fillTemplate(activeMsg, SAMPLE, user?.name || 'Sharath');

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.glow} pointerEvents="none" />

        <Text style={styles.label}>VISITOR EXPERIENCE</Text>
        <Text style={styles.title}>Greeting Message</Text>
        <Text style={styles.sub}>Sent to visitors on WhatsApp after they check in.</Text>

        {/* Template picker */}
        <Text style={styles.sectionLabel}>TEMPLATE</Text>
        <View style={styles.chipRow}>
          {templateKeys.map(k => (
            <TouchableOpacity
              key={k}
              style={[styles.chip, settings.activeTemplate === k && styles.chipActive]}
              onPress={() => setSettings(s => ({ ...s, activeTemplate: k }))}
            >
              <Text style={[styles.chipText, settings.activeTemplate === k && styles.chipTextActive]}>
                {settings.labels[k] || k}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Editable message */}
        <Text style={styles.sectionLabel}>MESSAGE</Text>
        <View style={styles.editorCard}>
          <TextInput
            style={styles.editor}
            value={activeMsg}
            onChangeText={setMessage}
            multiline
            placeholder="Type your greeting…"
            placeholderTextColor={colors.outlineVariant}
            textAlignVertical="top"
          />
        </View>
        <Text style={styles.hint}>
          Tags:  <Text style={styles.tag}>{'{name}'}</Text>  <Text style={styles.tag}>{'{showroom}'}</Text>  <Text style={styles.tag}>{'{staff}'}</Text>
        </Text>

        {/* Live preview */}
        <Text style={styles.sectionLabel}>PREVIEW</Text>
        <View style={styles.previewBubble}>
          <Text style={styles.previewText}>{preview}</Text>
        </View>

        {/* Toggles */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Ask before sending</Text>
            <Text style={styles.toggleSub}>Show a Send / Skip choice at check-in</Text>
          </View>
          <Switch
            value={settings.askBeforeSend}
            onValueChange={v => setSettings(s => ({ ...s, askBeforeSend: v }))}
            trackColor={{ true: colors.primary, false: colors.surfaceHigh }}
            thumbColor={colors.onPrimary}
          />
        </View>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Allow all staff to send</Text>
            <Text style={styles.toggleSub}>Off = managers & admins only</Text>
          </View>
          <Switch
            value={settings.allowAllStaff}
            onValueChange={v => setSettings(s => ({ ...s, allowAllStaff: v }))}
            trackColor={{ true: colors.primary, false: colors.surfaceHigh }}
            thumbColor={colors.onPrimary}
          />
        </View>

        {EOD_CONFIG.twilio.accountSid === 'YOUR_TWILIO_ACCOUNT_SID' && (
          <View style={styles.warn}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
            <Text style={styles.warnText}>
              Add your Twilio details in src/config/eodConfig.js for messages to actually send.
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveWrapper}>
          <LinearGradient colors={['#e9c176', '#c9952e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
            {saving ? <ActivityIndicator color={colors.onPrimary} /> : (
              <>
                <Ionicons name="checkmark-circle" size={18} color={colors.onPrimary} />
                <Text style={styles.saveText}>SAVE GREETING</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  content: { padding: spacing.lg },
  glow: {
    position: 'absolute', top: -80, right: -80, width: 260, height: 260,
    borderRadius: 130, backgroundColor: 'rgba(233,193,118,0.05)',
  },
  label: {
    fontFamily: fonts.manrope.semiBold, fontSize: 10,
    color: colors.primary, letterSpacing: 3, marginTop: spacing.sm,
  },
  title: {
    fontFamily: fonts.playfair.bold, fontSize: 26,
    color: colors.onSurface, marginTop: 4,
  },
  sub: { fontFamily: fonts.manrope.regular, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 4 },
  sectionLabel: {
    fontFamily: fonts.manrope.semiBold, fontSize: 10,
    color: colors.onSurfaceVariant, letterSpacing: 3,
    marginTop: spacing.xl, marginBottom: spacing.md,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.full,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: 'rgba(233,193,118,0.08)' },
  chipText: { fontFamily: fonts.manrope.medium, fontSize: 13, color: colors.onSurfaceVariant },
  chipTextActive: { color: colors.primary },
  editorCard: {
    backgroundColor: colors.glassBackground,
    borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.lg,
    padding: spacing.md,
  },
  editor: {
    fontFamily: fonts.manrope.regular, fontSize: 14,
    color: colors.onSurface, minHeight: 140, lineHeight: 21,
  },
  hint: { fontFamily: fonts.manrope.regular, fontSize: 11, color: colors.outlineVariant, marginTop: spacing.sm },
  tag: { fontFamily: fonts.manrope.bold, color: colors.primary },
  previewBubble: {
    backgroundColor: 'rgba(37,71,42,0.25)',
    borderWidth: 1, borderColor: 'rgba(168,213,162,0.25)',
    borderRadius: radius.lg, borderTopLeftRadius: 4,
    padding: spacing.md,
  },
  previewText: { fontFamily: fonts.manrope.regular, fontSize: 13, color: '#cfe6c9', lineHeight: 20 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, marginTop: spacing.sm,
    borderTopWidth: 1, borderTopColor: colors.glassBorder,
  },
  toggleTitle: { fontFamily: fonts.manrope.semiBold, fontSize: 14, color: colors.onSurface },
  toggleSub: { fontFamily: fonts.manrope.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  warn: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: 'rgba(245,215,142,0.08)', borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.lg,
  },
  warnText: { flex: 1, fontFamily: fonts.manrope.regular, fontSize: 11, color: colors.warning, lineHeight: 16 },
  saveWrapper: { borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.xl },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: 16, borderRadius: radius.full,
  },
  saveText: { fontFamily: fonts.manrope.extraBold, fontSize: 13, color: colors.onPrimary, letterSpacing: 2 },
});
