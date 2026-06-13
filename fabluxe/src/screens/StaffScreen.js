import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Modal, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../config/theme';
import {
  getAllStaff, createStaff, updateStaffPin,
  toggleStaffActive, deleteStaff, ROLES,
} from '../utils/authService';

const ROLE_COLORS = {
  admin:         { bg: 'rgba(201,168,76,0.15)', text: '#C9A84C' },
  manager:       { bg: 'rgba(74,144,217,0.15)', text: '#4A90D9' },
  receptionist:  { bg: 'rgba(56,142,60,0.15)',  text: '#388E3C' },
};

export default function StaffScreen({ user }) {
  const [staff, setStaff] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editPinModal, setEditPinModal] = useState(null); // staff member

  async function load() {
    setRefreshing(true);
    try { setStaff(await getAllStaff()); } finally { setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(member) {
    const action = member.active ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Staff?`,
      `${member.active ? 'Deactivated staff cannot log in.' : `${member.name} will be able to log in again.`}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: action.charAt(0).toUpperCase() + action.slice(1), onPress: async () => {
          await toggleStaffActive(member.id, !member.active);
          load();
        }},
      ]
    );
  }

  async function handleDelete(member) {
    Alert.alert(
      'Delete Staff Account?',
      `This will permanently delete ${member.name}'s account. They will not be able to log in.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteStaff(member.id);
          load();
        }},
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Staff Management</Text>
          <Text style={styles.headerSub}>{staff.length} accounts</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)}>
          <Ionicons name="person-add" size={18} color={COLORS.primary} />
          <Text style={styles.addBtnText}>Add Staff</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={staff}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        contentContainerStyle={{ padding: SPACING.md }}
        renderItem={({ item }) => {
          const roleStyle = ROLE_COLORS[item.role] || ROLE_COLORS.receptionist;
          return (
            <View style={[styles.card, !item.active && styles.cardInactive]}>
              <View style={styles.cardLeft}>
                <View style={[styles.avatar, !item.active && { opacity: 0.4 }]}>
                  <Text style={styles.avatarText}>{item.name?.[0]?.toUpperCase()}</Text>
                </View>
                <View>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, !item.active && styles.nameInactive]}>
                      {item.name}
                    </Text>
                    {!item.active && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveBadgeText}>INACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: roleStyle.bg }]}>
                    <Text style={[styles.roleText, { color: roleStyle.text }]}>
                      {item.role?.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.meta}>PIN: ••••</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setEditPinModal(item)}
                >
                  <Ionicons name="key-outline" size={20} color={COLORS.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleToggle(item)}
                >
                  <Ionicons
                    name={item.active ? 'pause-circle-outline' : 'play-circle-outline'}
                    size={20}
                    color={item.active ? COLORS.warning : COLORS.success}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={50} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Staff Added Yet</Text>
            <Text style={styles.emptySub}>Tap "Add Staff" to create the first account.</Text>
          </View>
        }
      />

      {/* Add Staff Modal */}
      <AddStaffModal
        visible={addModal}
        onClose={() => setAddModal(false)}
        onSaved={() => { setAddModal(false); load(); }}
      />

      {/* Edit PIN Modal */}
      {editPinModal && (
        <EditPinModal
          staff={editPinModal}
          onClose={() => setEditPinModal(null)}
          onSaved={() => { setEditPinModal(null); load(); }}
        />
      )}
    </View>
  );
}

// ── Add Staff Modal ────────────────────────────────────────────────────────────
function AddStaffModal({ visible, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [role, setRole] = useState(ROLES.RECEPTIONIST);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!name.trim()) return Alert.alert('Required', 'Enter staff name.');
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) return Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
    if (pin !== confirmPin) return Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');

    setLoading(true);
    try {
      await createStaff({ name: name.trim(), pin, role });
      Alert.alert('Done!', `${name.trim()} can now log in with their name and PIN.`);
      setName(''); setPin(''); setConfirmPin(''); setRole(ROLES.RECEPTIONIST);
      onSaved();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Staff</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>FULL NAME</Text>
          <TextInput
            style={styles.fieldInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Sharath"
            autoCapitalize="words"
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.fieldLabel}>ROLE</Text>
          <View style={styles.roleRow}>
            {Object.values(ROLES).map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.roleChip, role === r && styles.roleChipActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>4-DIGIT PIN</Text>
          <TextInput
            style={styles.fieldInput}
            value={pin}
            onChangeText={v => setPin(v.replace(/\D/g, '').slice(0, 4))}
            placeholder="e.g. 1234"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholderTextColor={COLORS.textLight}
          />

          <Text style={styles.fieldLabel}>CONFIRM PIN</Text>
          <TextInput
            style={styles.fieldInput}
            value={confirmPin}
            onChangeText={v => setConfirmPin(v.replace(/\D/g, '').slice(0, 4))}
            placeholder="Re-enter PIN"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholderTextColor={COLORS.textLight}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.primary} /> : (
              <Text style={styles.saveBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Edit PIN Modal ─────────────────────────────────────────────────────────────
function EditPinModal({ staff, onClose, onSaved }) {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (newPin.length !== 4) return Alert.alert('Invalid', 'PIN must be 4 digits.');
    if (newPin !== confirmPin) return Alert.alert('Mismatch', 'PINs do not match.');
    setLoading(true);
    try {
      await updateStaffPin(staff.id, newPin);
      Alert.alert('Updated', `${staff.name}'s PIN has been changed.`);
      onSaved();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change PIN — {staff.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldLabel}>NEW 4-DIGIT PIN</Text>
          <TextInput
            style={styles.fieldInput}
            value={newPin}
            onChangeText={v => setNewPin(v.replace(/\D/g, '').slice(0, 4))}
            placeholder="Enter new PIN"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholderTextColor={COLORS.textLight}
          />
          <Text style={styles.fieldLabel}>CONFIRM NEW PIN</Text>
          <TextInput
            style={styles.fieldInput}
            value={confirmPin}
            onChangeText={v => setConfirmPin(v.replace(/\D/g, '').slice(0, 4))}
            placeholder="Re-enter PIN"
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            placeholderTextColor={COLORS.textLight}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.primary} /> : (
              <Text style={styles.saveBtnText}>Update PIN</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary, padding: SPACING.lg, paddingTop: SPACING.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: COLORS.accentLight, fontSize: 12, marginTop: 2 },
  addBtn: {
    backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  addBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', elevation: 2,
  },
  cardInactive: { opacity: 0.65 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  avatar: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: COLORS.accent, fontSize: 20, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  nameInactive: { color: COLORS.textLight },
  inactiveBadge: {
    backgroundColor: COLORS.error + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  inactiveBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.error },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4, alignSelf: 'flex-start' },
  roleText: { fontSize: 10, fontWeight: '700' },
  meta: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: SPACING.sm },
  empty: { alignItems: 'center', paddingTop: SPACING.xxl },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  emptySub: { fontSize: 13, color: COLORS.textLight, marginTop: SPACING.sm, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: '#0009', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl, padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textLight, letterSpacing: 1.5, marginBottom: 6 },
  fieldInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, color: COLORS.text, fontSize: 15,
    backgroundColor: COLORS.background, marginBottom: SPACING.md,
  },
  roleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  roleChip: {
    flex: 1, padding: SPACING.sm, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  roleChipTextActive: { color: COLORS.accent },
  saveBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm,
  },
  saveBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
});
