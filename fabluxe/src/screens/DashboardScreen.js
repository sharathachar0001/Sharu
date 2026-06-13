import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import { getAllVisitors, getFollowUps, VISITOR_STATUS } from '../utils/visitorService';
import { format } from 'date-fns';

export default function DashboardScreen({ user, navigation }) {
  const [stats, setStats] = useState({ today: 0, week: 0, followUp: 0, converted: 0 });
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const all = await getAllVisitors(7);
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');

      const todayCount = all.filter(v => {
        const d = v.createdAt?.toDate?.() || new Date(v.createdAt);
        return format(d, 'yyyy-MM-dd') === todayStr;
      }).length;

      const converted = all.filter(v => v.status === VISITOR_STATUS.CONVERTED).length;
      const followUp = all.filter(
        v => v.status === VISITOR_STATUS.NEW || v.status === VISITOR_STATUS.FOLLOW_UP
      ).length;

      setStats({ today: todayCount, week: all.length, followUp, converted });
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const statCards = [
    { label: "Today's Visitors", value: stats.today, icon: 'people', color: COLORS.accent },
    { label: 'This Week', value: stats.week, icon: 'calendar', color: '#4A90D9' },
    { label: 'Need Follow-Up', value: stats.followUp, icon: 'alarm', color: '#E07B39' },
    { label: 'Converted', value: stats.converted, icon: 'checkmark-circle', color: COLORS.success },
  ];

  const quickActions = [
    { label: 'New Visitor', icon: 'person-add', screen: 'CheckIn', color: COLORS.accent },
    { label: 'All Visitors', icon: 'list', screen: 'Visitors', color: '#4A90D9' },
    { label: 'Follow-Ups', icon: 'alarm-outline', screen: 'FollowUp', color: '#E07B39' },
    { label: 'Reports', icon: 'bar-chart', screen: 'Reports', color: '#7B68EE' },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()}, {user?.name?.split(' ')[0]}!</Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, dd MMMM yyyy')}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        {statCards.map((c, i) => (
          <View key={i} style={[styles.statCard, { borderLeftColor: c.color }]}>
            <Ionicons name={c.icon} size={24} color={c.color} />
            <Text style={styles.statValue}>{c.value}</Text>
            <Text style={styles.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((a, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.actionCard, { borderTopColor: a.color }]}
            onPress={() => navigation.navigate(a.screen)}
          >
            <Ionicons name={a.icon} size={28} color={a.color} />
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { color: '#fff', fontSize: 20, fontWeight: '700' },
  date: { color: COLORS.accentLight, fontSize: 13, marginTop: 2 },
  badge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    width: '47%',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statValue: { fontSize: 32, fontWeight: '800', color: COLORS.text, marginTop: SPACING.xs },
  statLabel: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    width: '47%',
    alignItems: 'center',
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginTop: SPACING.sm },
});
