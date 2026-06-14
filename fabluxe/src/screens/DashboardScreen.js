import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../config/theme';
import { getAllVisitors, VISITOR_STATUS } from '../utils/visitorService';
import { format } from 'date-fns';

export default function DashboardScreen({ user, navigation }) {
  const [stats, setStats] = useState({ today: 0, week: 0, followUp: 0, converted: 0 });
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    try {
      const all = await getAllVisitors(7);
      const todayStr = format(new Date(), 'yyyy-MM-dd');
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

  const kpiCards = [
    { label: "Today's Visitors", value: stats.today, color: colors.primary },
    { label: 'This Week', value: stats.week, color: colors.tertiary },
    { label: 'Follow-Ups', value: stats.followUp, color: colors.error },
    { label: 'Converted', value: stats.converted, color: colors.success },
  ];

  const quickActions = [
    { label: 'New Visitor', icon: 'person-add', screen: 'CheckIn' },
    { label: 'All Visitors', icon: 'people-outline', screen: 'Visitors' },
    { label: 'Follow-Ups', icon: 'alarm-outline', screen: 'FollowUp' },
    { label: 'Reports', icon: 'bar-chart-outline', screen: 'Reports' },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
    >
      <View style={styles.glowTR} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>OPERATIONAL OVERVIEW</Text>
          <Text style={styles.greeting}>
            Good {getGreeting()},{' '}
            <Text style={styles.greetingName}>{user?.name?.split(' ')[0]}.</Text>
          </Text>
          <Text style={styles.date}>{format(new Date(), 'EEEE, dd MMMM yyyy')}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        {kpiCards.map((c, i) => (
          <View key={i} style={styles.kpiCard}>
            <Text style={[styles.kpiValue, { color: c.color }]}>{c.value}</Text>
            <Text style={styles.kpiLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      {/* New Check-In CTA */}
      <TouchableOpacity onPress={() => navigation.navigate('CheckIn')} style={styles.ctaWrapper}>
        <LinearGradient colors={['#e9c176', '#c9952e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
          <Ionicons name="person-add" size={18} color={colors.onPrimary} />
          <Text style={styles.ctaBtnText}>NEW CHECK-IN</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Actions */}
      <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((a, i) => (
          <TouchableOpacity
            key={i}
            style={styles.actionCard}
            onPress={() => navigation.navigate(a.screen)}
          >
            <View style={styles.actionIcon}>
              <Ionicons name={a.icon} size={22} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: spacing.xxl }} />
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
  container: { flex: 1, backgroundColor: colors.background },
  glowTR: {
    position: 'absolute', top: -80, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(233,193,118,0.05)',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: spacing.lg, paddingTop: spacing.xl,
    borderBottomWidth: 1, borderBottomColor: colors.glassBorder,
  },
  headerLabel: {
    fontFamily: fonts.manrope.semiBold, fontSize: 10,
    color: colors.primary, letterSpacing: 3, marginBottom: spacing.xs,
  },
  greeting: {
    fontFamily: fonts.playfair.bold, fontSize: 26,
    color: colors.onSurface, marginBottom: 4,
  },
  greetingName: { color: colors.primary, fontStyle: 'italic' },
  date: {
    fontFamily: fonts.manrope.regular, fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  avatarCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(233,193,118,0.12)',
    borderWidth: 1, borderColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontFamily: fonts.manrope.bold, fontSize: 16, color: colors.primary },
  kpiRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    padding: spacing.lg, gap: spacing.sm,
  },
  kpiCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: colors.glassBackground,
    borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: radius.lg, padding: spacing.md, alignItems: 'center',
  },
  kpiValue: { fontFamily: fonts.playfair.bold, fontSize: 32 },
  kpiLabel: {
    fontFamily: fonts.manrope.regular, fontSize: 10,
    color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 4,
  },
  ctaWrapper: { marginHorizontal: spacing.lg, marginBottom: spacing.lg, borderRadius: radius.full, overflow: 'hidden' },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: 14, borderRadius: radius.full,
  },
  ctaBtnText: {
    fontFamily: fonts.manrope.extraBold, fontSize: 13,
    color: colors.onPrimary, letterSpacing: 2,
  },
  sectionLabel: {
    fontFamily: fonts.manrope.semiBold, fontSize: 10,
    color: colors.onSurfaceVariant, letterSpacing: 3,
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.lg, gap: spacing.sm,
  },
  actionCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: colors.glassBackground,
    borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: radius.lg, padding: spacing.lg,
    alignItems: 'center', gap: spacing.sm,
  },
  actionIcon: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(233,193,118,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  actionLabel: {
    fontFamily: fonts.manrope.semiBold, fontSize: 12,
    color: colors.onSurface, textAlign: 'center',
  },
});
