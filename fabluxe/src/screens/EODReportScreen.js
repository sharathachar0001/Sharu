import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, Switch, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import { EOD_CONFIG } from '../config/eodConfig';
import {
  getEODData, formatWhatsAppMessage, sendWhatsAppReport,
} from '../utils/eodReportService';
import { exportToPDF } from '../utils/exportService';
import { format } from 'date-fns';

export default function EODReportScreen({ user }) {
  const [loading, setLoading] = useState(false);
  const [eodData, setEodData] = useState(null);
  const [message, setMessage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [sendingWA, setSendingWA] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleHour, setScheduleHour] = useState(
    String(EOD_CONFIG.scheduleTime.hour).padStart(2, '0')
  );
  const [scheduleMin, setScheduleMin] = useState(
    String(EOD_CONFIG.scheduleTime.minute).padStart(2, '0')
  );

  async function loadReport() {
    setLoading(true);
    try {
      const data = await getEODData(new Date());
      setEodData(data);
      setMessage(formatWhatsAppMessage(data));
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReport(); }, []);

  async function handleSendWhatsApp() {
    if (!eodData) return;
    setSendingWA(true);
    try {
      await sendWhatsAppReport(message);
      Alert.alert('Sent!', `EOD report sent to ${EOD_CONFIG.recipients.length} recipient(s) on WhatsApp.`);
    } catch (e) {
      Alert.alert('WhatsApp Error', e.message);
    } finally {
      setSendingWA(false);
    }
  }

  async function handleExportPDF() {
    if (!eodData) return;
    setExportingPDF(true);
    try {
      await exportToPDF(eodData.visitors, `EOD — ${format(new Date(), 'dd MMM yyyy')}`);
    } catch (e) {
      Alert.alert('Export Error', e.message);
    } finally {
      setExportingPDF(false);
    }
  }

  const today = format(new Date(), 'EEEE, dd MMMM yyyy');
  const configuredRecipients = EOD_CONFIG.recipients.length;
  const isConfigured = EOD_CONFIG.twilio.accountSid !== 'YOUR_TWILIO_ACCOUNT_SID';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="document-text" size={28} color={COLORS.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>EOD Report</Text>
          <Text style={styles.headerSub}>{today}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadReport}>
          <Ionicons name="refresh" size={20} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* WhatsApp Status */}
      {!isConfigured && (
        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            WhatsApp not configured. Update{' '}
            <Text style={{ fontWeight: '700' }}>src/config/eodConfig.js</Text>
            {' '}with your Twilio credentials.
          </Text>
        </View>
      )}

      {/* Today's Summary */}
      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={COLORS.accent} size="large" />
          <Text style={styles.loadingText}>Generating report...</Text>
        </View>
      ) : eodData ? (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.cardLabel}>TODAY'S SUMMARY</Text>
            <View style={styles.statsRow}>
              <StatBox icon="👥" label="Visitors" value={eodData.total} color={COLORS.accent} />
              <StatBox icon="✅" label="Converted" value={eodData.converted} color={COLORS.success} />
              <StatBox icon="⏰" label="Follow-Up" value={eodData.followUp} color={COLORS.warning} />
              <StatBox icon="📈" label="Conv.%" value={`${eodData.convRate}%`} color="#4A90D9" />
            </View>
          </View>

          {/* Source Breakdown */}
          {Object.keys(eodData.sourceCount).length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>VISITOR SOURCES</Text>
              {Object.entries(eodData.sourceCount)
                .sort((a, b) => b[1] - a[1])
                .map(([s, c]) => (
                  <View key={s} style={styles.row}>
                    <Text style={styles.rowKey}>{s}</Text>
                    <View style={styles.rowBar}>
                      <View style={[styles.rowFill, {
                        width: `${(c / eodData.total) * 100}%`,
                        backgroundColor: COLORS.accent,
                      }]} />
                    </View>
                    <Text style={styles.rowCount}>{c}</Text>
                  </View>
                ))}
            </View>
          )}

          {/* WhatsApp Message Preview */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>WHATSAPP MESSAGE PREVIEW</Text>
              <TouchableOpacity onPress={() => setPreviewVisible(true)}>
                <Text style={styles.expandBtn}>Full Preview ›</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.waPreview}>
              <Text style={styles.waText} numberOfLines={8}>{message}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsCard}>
            <Text style={styles.cardLabel}>SEND REPORT</Text>

            <TouchableOpacity
              style={[styles.actionBtn, styles.whatsappBtn, !isConfigured && styles.disabledBtn]}
              onPress={handleSendWhatsApp}
              disabled={sendingWA || !isConfigured}
            >
              {sendingWA ? <ActivityIndicator color="#fff" size="small" /> : (
                <>
                  <Ionicons name="logo-whatsapp" size={22} color="#fff" />
                  <View>
                    <Text style={styles.actionBtnText}>Send via WhatsApp</Text>
                    <Text style={styles.actionBtnSub}>
                      {isConfigured
                        ? `${configuredRecipients} recipient${configuredRecipients !== 1 ? 's' : ''} configured`
                        : 'Setup required in eodConfig.js'}
                    </Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.pdfBtn]}
              onPress={handleExportPDF}
              disabled={exportingPDF}
            >
              {exportingPDF ? <ActivityIndicator color="#fff" size="small" /> : (
                <>
                  <Ionicons name="document-outline" size={22} color="#fff" />
                  <View>
                    <Text style={styles.actionBtnText}>Export as PDF</Text>
                    <Text style={styles.actionBtnSub}>Share via email, Drive, etc.</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.copyBtn]}
              onPress={() => {
                // Copy message to clipboard
                setPreviewVisible(true);
                Alert.alert('Tip', 'Long press the message text to copy it manually.');
              }}
            >
              <Ionicons name="copy-outline" size={22} color={COLORS.text} />
              <View>
                <Text style={[styles.actionBtnText, { color: COLORS.text }]}>Copy Message</Text>
                <Text style={[styles.actionBtnSub, { color: COLORS.textLight }]}>
                  Paste in any WhatsApp chat
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Schedule Section */}
          <View style={styles.card}>
            <View style={styles.scheduleHeader}>
              <View>
                <Text style={styles.cardLabel}>AUTO-SEND SCHEDULE</Text>
                <Text style={styles.cardSub}>Send EOD report automatically every day</Text>
              </View>
              <Switch
                value={scheduleEnabled}
                onValueChange={setScheduleEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={scheduleEnabled ? COLORS.primary : '#fff'}
              />
            </View>

            {scheduleEnabled && (
              <View style={styles.timePicker}>
                <Ionicons name="time-outline" size={20} color={COLORS.accent} />
                <Text style={styles.timeLabel}>Send at</Text>
                <TextInput
                  style={styles.timeInput}
                  value={scheduleHour}
                  onChangeText={v => setScheduleHour(v.replace(/\D/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.timeColon}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={scheduleMin}
                  onChangeText={v => setScheduleMin(v.replace(/\D/g, '').slice(0, 2))}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.timeAMPM}>
                  {parseInt(scheduleHour) >= 12 ? 'PM' : 'AM'}
                </Text>
                <TouchableOpacity
                  style={styles.saveTimeBtn}
                  onPress={() => Alert.alert(
                    'Schedule Saved',
                    `EOD report will be sent daily at ${scheduleHour}:${scheduleMin} ${parseInt(scheduleHour) >= 12 ? 'PM' : 'AM'}`
                  )}
                >
                  <Text style={styles.saveTimeBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.recipientsList}>
              <Text style={styles.recipientsTitle}>
                Recipients ({configuredRecipients} configured)
              </Text>
              {EOD_CONFIG.recipients.length === 0 ? (
                <Text style={styles.noRecipients}>
                  Add recipients in{'\n'}src/config/eodConfig.js → recipients[ ]
                </Text>
              ) : (
                EOD_CONFIG.recipients.map((r, i) => (
                  <View key={i} style={styles.recipientRow}>
                    <Ionicons name="logo-whatsapp" size={16} color={COLORS.success} />
                    <Text style={styles.recipientName}>{r.name}</Text>
                    <Text style={styles.recipientNumber}>{r.number.replace('whatsapp:', '')}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </>
      ) : null}

      {/* Full Message Preview Modal */}
      <Modal visible={previewVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>WhatsApp Message</Text>
              <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.waPreviewFull}>
              <ScrollView>
                <Text selectable style={styles.waTextFull}>{message}</Text>
              </ScrollView>
            </View>
            <Text style={styles.modalHint}>Long press message to copy</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary, padding: SPACING.lg, paddingTop: SPACING.xl,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: COLORS.accentLight, fontSize: 12, marginTop: 2 },
  refreshBtn: {
    backgroundColor: 'rgba(201,168,76,0.2)', padding: SPACING.sm, borderRadius: RADIUS.sm,
  },
  warningCard: {
    backgroundColor: '#FFF8E1', margin: SPACING.md, borderRadius: RADIUS.md,
    padding: SPACING.md, flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    borderLeftWidth: 4, borderLeftColor: COLORS.warning,
  },
  warningText: { flex: 1, fontSize: 12, color: '#5D4037', lineHeight: 18 },
  loadingCard: { alignItems: 'center', padding: SPACING.xxl },
  loadingText: { color: COLORS.textLight, marginTop: SPACING.md },
  summaryCard: {
    backgroundColor: COLORS.surface, margin: SPACING.md, borderRadius: RADIUS.lg,
    padding: SPACING.md, elevation: 3,
  },
  card: {
    backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.md, elevation: 2,
  },
  cardLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.accent,
    letterSpacing: 1.5, marginBottom: SPACING.sm,
  },
  cardSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expandBtn: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  statBox: {
    flex: 1, backgroundColor: COLORS.background, borderRadius: RADIUS.sm,
    padding: SPACING.sm, alignItems: 'center', borderTopWidth: 3,
  },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 9, color: COLORS.textLight, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  rowKey: { width: 80, fontSize: 12, color: COLORS.text },
  rowBar: { flex: 1, height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden' },
  rowFill: { height: 8, borderRadius: 4 },
  rowCount: { width: 24, textAlign: 'right', fontSize: 12, fontWeight: '700', color: COLORS.text },
  waPreview: {
    backgroundColor: '#E8F5E9', borderRadius: RADIUS.sm, padding: SPACING.sm, marginTop: SPACING.sm,
  },
  waText: { fontSize: 11, color: '#1B5E20', lineHeight: 18, fontFamily: 'monospace' },
  actionsCard: {
    backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.md, elevation: 2,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.sm,
  },
  whatsappBtn: { backgroundColor: '#25D366' },
  pdfBtn: { backgroundColor: COLORS.error },
  copyBtn: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  disabledBtn: { opacity: 0.5 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  actionBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 1 },
  scheduleHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md,
  },
  timePicker: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  timeLabel: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  timeInput: {
    width: 44, height: 40, borderWidth: 1, borderColor: COLORS.accent,
    borderRadius: RADIUS.sm, textAlign: 'center', fontSize: 18, fontWeight: '700', color: COLORS.text,
  },
  timeColon: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  timeAMPM: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  saveTimeBtn: {
    backgroundColor: COLORS.accent, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm, marginLeft: 'auto',
  },
  saveTimeBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  recipientsList: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  recipientsTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  noRecipients: {
    fontSize: 12, color: COLORS.textLight, fontStyle: 'italic',
    backgroundColor: COLORS.background, padding: SPACING.sm, borderRadius: RADIUS.sm,
    lineHeight: 18,
  },
  recipientRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.xs + 2,
  },
  recipientName: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },
  recipientNumber: { fontSize: 12, color: COLORS.textLight },
  modalOverlay: { flex: 1, backgroundColor: '#0009', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  waPreviewFull: {
    backgroundColor: '#E8F5E9', borderRadius: RADIUS.md, padding: SPACING.md, maxHeight: 400,
  },
  waTextFull: { fontSize: 13, color: '#1B5E20', lineHeight: 20 },
  modalHint: { fontSize: 11, color: COLORS.textLight, textAlign: 'center', marginTop: SPACING.sm },
});
