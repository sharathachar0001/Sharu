import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '../config/theme';
import { getAllVisitors, getFollowUps, VISITOR_STATUS } from '../utils/visitorService';
import { format } from 'date-fns';

export default function DashboardScreen({ user, navigation }) {
  const [stats, setStats] = useState({ today: 0, week: 0, followUp: 0, converted: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [recentVisitors, setRecentVisitors] = useState([]);

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
      setRecentVisitors(all.slice(0, 10));
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const kpiCards = [
    { label: "Today's Check-ins", value: stats.today, icon: 'people', color: colors.primary },
    { label: 'This Week', value: stats.week, icon: 'calendar-outline', color: colors.tertiary },
    { label: 'Follow-Ups', value: stats.followUp, icon: 'alarm-outline', color: colors.error },
  ];

  const firstName = user?.name?.split(' ')[0] || 'there';
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const filtered = recentVisitors.filter(v =>
    !search || (v.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
    >
      {/* Ambient glows */}
      <View style={styles.glowTL} pointerEvents="none" />
      <View style={styles.glowBR} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.brandText}>FABLUXE</Text>
          <View style={styles.goldLine} />
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* Welcome */}
      <Text style={styles.overviewLabel}>OPERATIONAL OVERVIEW</Text>
      <Text style={styles.welcomeHeadline}>Welcome back, {firstName}.</Text>
      <Text style={styles.dateText}>{format(new Date(), 'EEEE, dd MMMM yyyy')}</Text>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        {kpiCards.map((card, i) => (
          <View key={i} style={styles.kpiCard}>
            <Ionicons name={card.icon} size={20} color={card.color} />
            <Text style={[styles.kpiValue, { color: card.color }]}>{card.value}</Text>
            <Text style={styles.kpiLabel}>{card.label}</Text>
          </View>
        ))}
      </View>

      {/* New Check-In Button */}
      <TouchableOpacity
        style={styles.checkInWrapper}
        onPress={() => navigation.navigate('CheckIn')}
      >
        <LinearGradient
          colors={['#e9c176', '#c9952e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.checkInBtn}
        >
          <Ionicons name="person-add-outline" size={18} color={colors.onPrimary} />
          <Text style={styles.checkInText}>NEW CHECK-IN</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={colors.outlineVariant} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search visitors..."
          placeholderTextColor={colors.outlineVariant}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Recent Check-Ins */}
      <Text style={styles.sectionLabel}>RECENT CHECK-INS</Text>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={32} color={colors.outlineVariant} />
          <Text style={styles.emptyText}>No visitors found</Text>
        </View>
      ) : (
        filtered.map((visitor, i) => {
          const date = visitor.createdAt?.toDate?.() || new Date(visitor.createdAt);
          const statusColor =
            visitor.status === VISITOR_STATUS.CONVERTED ? colors.success :
            visitor.status === VISITOR_STATUS.FOLLOW_UP ? colors.warning :
            colors.tertiary;
          return (
            <TouchableOpacity
              key={visitor.id || i}
              style={styles.visitorCard}
              onPress={() => navigation.navigate('Visitors')}
            >
              <View style={[styles.visitorDot, { backgroundColor: statusColor }]} />
              <View style={styles.visitorInfo}>
                <Text style={styles.visitorName}>{visitor.name || 'Unknown'}</Text>
                <Text style={styles.visitorMeta}>
                  {visitor.phone || '—'} · {format(date, 'dd MMM, hh:mm a')}
                </Text>
              </View>
              <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {(visitor.status || 'new').toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  glowTL: {
    position: 'absolute', top: -80, left: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(233,193,118,0.05)',
    zIndex: 0,
  },
  glowBR: {
    position: 'absolute', top: 300, right: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(233,193,118,0.03)',
    zIndex: 0,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingTop: spacing.xxl, paddingBottom: spacing.md,
  },
  headerLeft: {},
  brandText: {
    fontFamily: fonts.playfair.bold, fontSize: 28,
    color: colors.primary, letterSpacing: 8,
  },
  goldLine: {
    width: 40, height: 1.5, backgroundColor: colors.primary,
    marginTop: 4, opacity: 0.5,
  },
  avatarCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1.5, borderColor: colors.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.manrope.bold, fontSize: 14, color: colors.primary,
  },
  overviewLabel: {
    fontFamily: fonts.manrope.semiBold, fontSize: 10,
    color: colors.outlineVariant, letterSpacing: 3, marginTop: spacing.xl,
  },
  welcomeHeadline: {
    fontFamily: fonts.playfair.semiBold, fontSize: 26,
    color: colors.onSurface, marginTop: spacing.xs,
  },
  dateText: {
    fontFamily: fonts.manrope.regular, fontSize: 12,
    color: colors.onSurfaceVariant, marginTop: 2, marginBottom: spacing.xl,
  },
  kpiRow: {
    flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.glassBackground,
    borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: radius.lg, padding: spacing.md,
    alignItems: 'center',
  },
  kpiValue: {
    fontFamily: fonts.playfair.bold, fontSize: 28, marginTop: spacing.xs,
  },
  kpiLabel: {
    fontFamily: fonts.manrope.regular, fontSize: 9,
    color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 2,
  },
  checkInWrapper: { borderRadius: radius.full, overflow: 'hidden', marginBottom: spacing.lg },
  checkInBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: 15, borderRadius: radius.full,
  },
  checkInText: {
    fontFamily: fonts.manrope.extraBold, fontSize: 13,
    color: colors.onPrimary, letterSpacing: 3,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.glassBackground,
    borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, marginBottom: spacing.lg,
  },
  searchInput: {
    flex: 1, fontFamily: fonts.manrope.regular, fontSize: 14,
    color: colors.onSurface,
  },
  sectionLabel: {
    fontFamily: fonts.manrope.semiBold, fontSize: 10,
    color: colors.outlineVariant, letterSpacing: 3, marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.manrope.regular, fontSize: 13, color: colors.outlineVariant,
  },
  visitorCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.glassBackground,
    borderWidth: 1, borderColor: colors.glassBorder,
    borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.sm, gap: spacing.md,
  },
  visitorDot: {
    width: 8, height: 8, borderRadius: 4,
  },
  visitorInfo: { flex: 1 },
  visitorName: {
    fontFamily: fonts.manrope.semiBold, fontSize: 14, color: colors.onSurface,
  },
  visitorMeta: {
    fontFamily: fonts.manrope.regular, fontSize: 11,
    color: colors.onSurfaceVariant, marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  statusText: {
    fontFamily: fonts.manrope.semiBold, fontSize: 9, letterSpacing: 1,
  },
});
