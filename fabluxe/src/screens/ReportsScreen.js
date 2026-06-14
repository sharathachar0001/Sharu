import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Share, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import { getAllVisitors, VISITOR_STATUS, VISIT_SOURCES } from '../utils/visitorService';
import { exportToExcel, exportToPDF } from '../utils/exportService';
import { format } from 'date-fns';

export default function ReportsScreen() {
  const [visitors, setVisitors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState(7);
  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf' | null

  async function load() {
    setRefreshing(true);
    try {
      const data = await getAllVisitors(range);
      setVisitors(data);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, [range]);

  // Stats
  const total = visitors.length;
  const converted = visitors.filter(v => v.status === VISITOR_STATUS.CONVERTED).length;
  const convRate = total ? Math.round((converted / total) * 100) : 0;

  // Source breakdown
  const sourceMap = {};
  visitors.forEach(v => {
    const s = v.source || 'Unknown';
    sourceMap[s] = (sourceMap[s] || 0) + 1;
  });
  const topSources = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Purpose breakdown
  const purposeMap = {};
  visitors.forEach(v => {
    const p = v.purpose || 'Unknown';
    purposeMap[p] = (purposeMap[p] || 0) + 1;
  });
  const topPurposes = Object.entries(purposeMap).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Daily counts for the selected range
  const dailyMap = {};
  visitors.forEach(v => {
    const d = v.createdAt?.toDate?.() || new Date(v.createdAt);
    const key = format(d, 'dd MMM');
    dailyMap[key] = (dailyMap[key] || 0) + 1;
  });

  async function handleExcel() {
    if (!visitors.length) return Alert.alert('No Data', 'No visitors found for this period.');
    setExporting('excel');
    try {
      await exportToExcel(visitors, `Last ${range} days`);
    } catch (e) {
      Alert.alert('Export Failed', e.message);
    } finally {
      setExporting(null);
    }
  }

  async function handlePDF() {
    if (!visitors.length) return Alert.alert('No Data', 'No visitors found for this period.');
    setExporting('pdf');
    try {
      await exportToPDF(visitors, `Last ${range} days`);
    } catch (e) {
      Alert.alert('Export Failed', e.message);
    } finally {
      setExporting(null);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <View style={styles.exportBtns}>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExcel} disabled={!!exporting}>
            {exporting === 'excel'
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <><Ionicons name="document-text-outline" size={16} color={COLORS.primary} /><Text style={styles.exportText}>Excel</Text></>
            }
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, styles.exportBtnPDF]} onPress={handlePDF} disabled={!!exporting}>
            {exporting === 'pdf'
              ? <ActivityIndicator size="small" color="#fff" />
              : <><Ionicons name="document-outline" size={16} color="#fff" /><Text style={[styles.exportText, { color: '#fff' }]}>PDF</Text></>
            }
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rangeRow}>
        {[7, 14, 30].map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.rangeBtn, range === d && styles.rangeBtnActive]}
            onPress={() => setRange(d)}
          >
            <Text style={[styles.rangeText, range === d && styles.rangeTextActive]}>
              Last {d} days
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsRow}>
        <StatBox label="Total" value={total} icon="people" color="#4A90D9" />
        <StatBox label="Converted" value={converted} icon="checkmark-circle" color={COLORS.success} />
        <StatBox label="Conv. Rate" value={`${convRate}%`} icon="trending-up" color={COLORS.accent} />
      </View>

      <Section title="Visitor Sources">
        {topSources.map(([s, c]) => (
          <BarRow key={s} label={s} count={c} max={topSources[0]?.[1] || 1} color="#4A90D9" />
        ))}
        {topSources.length === 0 && <EmptyRow />}
      </Section>

      <Section title="Visitor Interests">
        {topPurposes.map(([p, c]) => (
          <BarRow key={p} label={p} count={c} max={topPurposes[0]?.[1] || 1} color={COLORS.accent} />
        ))}
        {topPurposes.length === 0 && <EmptyRow />}
      </Section>

      <Section title={`Daily Visitors (Last ${range} days)`}>
        {Object.entries(dailyMap).map(([day, cnt]) => (
          <BarRow key={day} label={day} count={cnt} max={Math.max(...Object.values(dailyMap))} color="#7B68EE" />
        ))}
        {Object.keys(dailyMap).length === 0 && <EmptyRow />}
      </Section>
    </ScrollView>
  );
}

function StatBox({ label, value, icon, color }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BarRow({ label, count, max, color }) {
  const pct = max ? (count / max) * 100 : 0;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barCount}>{count}</Text>
    </View>
  );
}

function EmptyRow() {
  return <Text style={{ color: COLORS.textLight, textAlign: 'center', padding: SPACING.md }}>No data yet</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary, padding: SPACING.lg, paddingTop: SPACING.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  exportBtns: { flexDirection: 'row', gap: SPACING.sm },
  exportBtn: {
    backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center',
    gap: 4, paddingHorizontal: SPACING.sm + 2, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm, minWidth: 70, justifyContent: 'center',
  },
  exportBtnPDF: { backgroundColor: '#D32F2F' },
  exportText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  rangeRow: {
    flexDirection: 'row', margin: SPACING.md, gap: SPACING.sm,
  },
  rangeBtn: {
    flex: 1, padding: SPACING.sm, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  rangeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  rangeText: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },
  rangeTextActive: { color: '#fff' },
  statsRow: {
    flexDirection: 'row', marginHorizontal: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.md,
  },
  statBox: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', borderTopWidth: 3, elevation: 2,
  },
  statValue: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginTop: SPACING.xs },
  statLabel: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  section: {
    backgroundColor: COLORS.surface, margin: SPACING.md, borderRadius: RADIUS.md,
    padding: SPACING.md, elevation: 2, marginTop: 0,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SPACING.sm,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  barLabel: { width: 110, fontSize: 12, color: COLORS.text },
  barTrack: { flex: 1, height: 10, backgroundColor: COLORS.background, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5 },
  barCount: { width: 30, textAlign: 'right', fontSize: 12, fontWeight: '700', color: COLORS.text },
});
