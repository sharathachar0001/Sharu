import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import { getFollowUps, updateVisitorStatus, VISITOR_STATUS } from '../utils/visitorService';
import { format, differenceInDays } from 'date-fns';

export default function FollowUpScreen() {
  const [visitors, setVisitors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const data = await getFollowUps();
      setVisitors(data);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  function urgency(v) {
    const d = v.createdAt?.toDate?.() || new Date(v.createdAt);
    const days = differenceInDays(new Date(), d);
    if (days >= 3) return { label: 'Urgent', color: COLORS.error };
    if (days >= 1) return { label: 'Due', color: '#E07B39' };
    return { label: 'Today', color: COLORS.success };
  }

  async function markConverted(id) {
    Alert.alert('Mark as Converted?', 'This visitor will be marked as a converted customer.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm', onPress: async () => {
          await updateVisitorStatus(id, VISITOR_STATUS.CONVERTED);
          load();
        },
      },
    ]);
  }

  async function markNotInterested(id) {
    await updateVisitorStatus(id, VISITOR_STATUS.NOT_INTERESTED);
    load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="alarm" size={28} color={COLORS.accent} />
        <Text style={styles.headerTitle}>Follow-Up Tracker</Text>
        <Text style={styles.headerCount}>{visitors.length} pending</Text>
      </View>

      <FlatList
        data={visitors}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        contentContainerStyle={{ padding: SPACING.md }}
        renderItem={({ item }) => {
          const u = urgency(item);
          const date = item.createdAt?.toDate?.() || new Date(item.createdAt);
          const days = differenceInDays(new Date(), date);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>{item.phone}  ·  {item.purpose}</Text>
                  <Text style={styles.meta}>Visited {format(date, 'dd MMM')} · {days}d ago</Text>
                  {item.followUpNote ? (
                    <Text style={styles.note}>"{item.followUpNote}"</Text>
                  ) : null}
                </View>
                <View style={[styles.urgency, { backgroundColor: u.color + '22' }]}>
                  <Text style={[styles.urgencyText, { color: u.color }]}>{u.label}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: COLORS.success }]}
                  onPress={() => markConverted(item.id)}
                >
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={[styles.actionText, { color: COLORS.success }]}>Converted</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: COLORS.textLight }]}
                  onPress={() => markNotInterested(item.id)}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.textLight} />
                  <Text style={[styles.actionText, { color: COLORS.textLight }]}>Not Interested</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle" size={60} color={COLORS.success} />
            <Text style={styles.emptyText}>All caught up!</Text>
            <Text style={styles.emptySub}>No pending follow-ups</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary, padding: SPACING.lg, paddingTop: SPACING.xl,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1 },
  headerCount: {
    color: COLORS.accent, fontSize: 14, fontWeight: '600',
    backgroundColor: COLORS.accent + '22', paddingHorizontal: SPACING.sm,
    paddingVertical: 4, borderRadius: RADIUS.sm,
  },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  note: { fontSize: 12, color: COLORS.accent, fontStyle: 'italic', marginTop: 4 },
  urgency: { padding: SPACING.xs + 2, borderRadius: RADIUS.sm, alignSelf: 'flex-start' },
  urgencyText: { fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  actionBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: RADIUS.sm, padding: SPACING.sm,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  actionText: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: SPACING.xxl },
  emptyText: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  emptySub: { fontSize: 14, color: COLORS.textLight, marginTop: SPACING.sm },
});
