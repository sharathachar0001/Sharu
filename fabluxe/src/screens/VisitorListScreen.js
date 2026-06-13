import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  RefreshControl, Modal, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import { getAllVisitors, updateVisitorStatus, setFollowUpDate, VISITOR_STATUS } from '../utils/visitorService';
import { format } from 'date-fns';

const STATUS_COLORS = {
  [VISITOR_STATUS.NEW]: '#4A90D9',
  [VISITOR_STATUS.FOLLOW_UP]: '#E07B39',
  [VISITOR_STATUS.CONVERTED]: COLORS.success,
  [VISITOR_STATUS.NOT_INTERESTED]: COLORS.textLight,
};

export default function VisitorListScreen() {
  const [visitors, setVisitors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  async function load() {
    setRefreshing(true);
    try {
      const data = await getAllVisitors(30);
      setVisitors(data);
      setFiltered(data);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? visitors.filter(v =>
        v.name?.toLowerCase().includes(q) ||
        v.phone?.includes(q) ||
        v.purpose?.toLowerCase().includes(q)
      ) : visitors
    );
  }, [search, visitors]);

  async function changeStatus(id, status) {
    await updateVisitorStatus(id, status);
    setSelected(null);
    load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, purpose..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={COLORS.textLight}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.count}>{filtered.length} visitors (last 30 days)</Text>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelected(item)}>
            <View style={styles.cardRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.phone}  ·  {item.purpose}</Text>
                <Text style={styles.meta}>
                  {item.source ? `via ${item.source}  ·  ` : ''}
                  {item.createdAt?.toDate
                    ? format(item.createdAt.toDate(), 'dd MMM, hh:mm a')
                    : ''}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No visitors found.</Text>}
      />

      {selected && (
        <VisitorModal
          visitor={selected}
          onClose={() => setSelected(null)}
          onStatusChange={changeStatus}
        />
      )}
    </View>
  );
}

function VisitorModal({ visitor, onClose, onStatusChange }) {
  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView>
            <View style={styles.modalHeader}>
              <Text style={styles.modalName}>{visitor.name}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {[
              ['Phone', visitor.phone],
              ['Email', visitor.email || '—'],
              ['Purpose', visitor.purpose],
              ['Source', visitor.source || '—'],
              ['Added by', visitor.addedBy],
              ['Status', visitor.status],
              ['Notes', visitor.notes || '—'],
            ].map(([k, v]) => (
              <View key={k} style={styles.row}>
                <Text style={styles.rowKey}>{k}</Text>
                <Text style={styles.rowVal}>{v}</Text>
              </View>
            ))}

            <Text style={styles.actionsTitle}>Update Status</Text>
            {Object.values(VISITOR_STATUS).map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, { borderColor: STATUS_COLORS[s] }]}
                onPress={() => onStatusChange(visitor.id, s)}
              >
                <Text style={{ color: STATUS_COLORS[s], fontWeight: '600' }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    margin: SPACING.md, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  searchInput: { flex: 1, padding: SPACING.sm, color: COLORS.text, fontSize: 14 },
  count: { color: COLORS.textLight, fontSize: 13, marginLeft: SPACING.lg, marginBottom: SPACING.sm },
  card: {
    backgroundColor: COLORS.surface, marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm, borderRadius: RADIUS.md, padding: SPACING.md,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: COLORS.accent, fontSize: 18, fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: SPACING.xl },
  overlay: { flex: 1, backgroundColor: '#0008', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md,
  },
  modalName: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  rowKey: { fontSize: 13, color: COLORS.textLight, flex: 1 },
  rowVal: { fontSize: 13, color: COLORS.text, flex: 2, textAlign: 'right' },
  actionsTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md, marginBottom: SPACING.sm },
  statusBtn: {
    borderWidth: 1.5, borderRadius: RADIUS.sm, padding: SPACING.sm,
    alignItems: 'center', marginBottom: SPACING.sm,
  },
});
