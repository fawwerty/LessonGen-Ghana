import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../utils/AuthContext';
import { colors, shadow } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

const C = colors;

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'T';
  const isPro = user?.plan !== 'free';

  return (
    <View style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* User Header */}
        <View style={[s.header, { paddingTop: insets.top + 10 }]}>
          <View style={[s.avatarWrap, isPro && s.avatarWrapPro]}>
            <Text style={[s.avatarText, isPro && { color: C.white }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={s.name} numberOfLines={1}>{user?.name}</Text>
            <Text style={s.school} numberOfLines={1}>{user?.school || 'Educator'}</Text>
            <View style={[s.planBadge, isPro && s.planBadgePro]}>
              <Text style={[s.planBadgeText, isPro && { color: C.white }]}>
                {isPro ? 'PRO MEMBER' : 'FREE ACCOUNT'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <Text style={s.statVal}>KG - B9</Text>
            <Text style={s.statLbl}>Levels</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statVal}>NaCCA</Text>
            <Text style={s.statLbl}>Standards</Text>
          </View>
        </View>

        {/* Upgrade Card (If Free) */}
        {!isPro && (
          <TouchableOpacity style={s.upgradeCard} onPress={() => navigation.navigate('Payment')}>
            <View style={s.upgradeIcon}>
              <Ionicons name="star" size={24} color={C.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.upgradeTitle}>Upgrade to PRO</Text>
              <Text style={s.upgradeSub}>Unlimited exports & batch generation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.gb} />
          </TouchableOpacity>
        )}

        {/* Account Settings Section */}
        <Text style={s.sectionTitle}>Account Details</Text>
        <View style={s.settingCard}>
          <SettingRow label="Email Address" value={user?.email} />
          <SettingRow label="Primary School" value={user?.school || 'Not set'} />
          <SettingRow label="Teaching Role" value={user?.role?.replace('_', ' ') || 'Teacher'} />
          <SettingRow label="Current Plan" value={user?.plan?.toUpperCase()} last />
        </View>

        {/* Admin Dashboard (Conditional) */}
        {user?.role === 'sys_admin' && (
          <>
            <Text style={[s.sectionTitle, { color: '#6366f1' }]}>Admin Control</Text>
            <TouchableOpacity 
              style={[s.settingCard, { backgroundColor: '#f5f3ff', borderColor: '#6366f1' }]}
              onPress={() => Linking.openURL('https://lessongen.com/admin')}
            >
              <View style={[s.row, { borderBottomWidth: 0 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                   <Ionicons name="shield-checkmark" size={18} color="#6366f1" />
                   <Text style={{ fontWeight: '700', color: '#6366f1' }}>Open Web Admin Console</Text>
                </View>
                <Ionicons name="open-outline" size={18} color="#6366f1" />
              </View>
            </TouchableOpacity>
          </>
        )}

        {/* Support Section */}
        <Text style={s.sectionTitle}>Support & Info</Text>
        <View style={s.settingCard}>
          <TouchableOpacity style={s.row} onPress={() => navigation.navigate('About')}>
            <Text style={s.rowLabel}>About LessonGen</Text>
            <Ionicons name="information-circle-outline" size={18} color={C.ink3} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL('mailto:support@lessongen.com')}>
            <Text style={s.rowLabel}>Contact Support</Text>
            <Ionicons name="mail-outline" size={18} color={C.ink3} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>LessonGen v1.4.0 · Ghana Edition</Text>
      </ScrollView>
    </View>
  );
}

function SettingRow({ label, value, last }) {
  return (
    <View style={[s.row, last && { borderBottomWidth: 0 }]}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.g4, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.g2,
  },
  avatarWrapPro: { backgroundColor: colors.g1, borderColor: colors.gd },
  avatarText: { fontSize: 24, fontWeight: '900', color: colors.g2 },
  name: { fontSize: 22, fontWeight: '900', color: colors.g1 },
  school: { fontSize: 13, color: colors.ink3, fontWeight: '600', marginTop: 2 },
  planBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.bg3, marginTop: 8 },
  planBadgePro: { backgroundColor: colors.gd },
  planBadgeText: { fontSize: 10, fontWeight: '800', color: colors.ink3 },
  
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: colors.white, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.bg3, alignItems: 'center', ...shadow },
  statVal: { fontSize: 16, fontWeight: '900', color: colors.g1 },
  statLbl: { fontSize: 11, color: colors.ink4, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  
  upgradeCard: { backgroundColor: colors.gl, padding: 18, borderRadius: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: colors.gd, ...shadow, shadowColor: colors.gd, shadowOpacity: 0.2 },
  upgradeIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.gb, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  upgradeTitle: { fontSize: 16, fontWeight: '900', color: colors.gb },
  upgradeSub: { fontSize: 12, color: colors.gb, opacity: 0.8 },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink2, marginBottom: 12, marginTop: 8 },
  settingCard: { backgroundColor: colors.white, borderRadius: 24, borderWidth: 1, borderColor: colors.bg3, overflow: 'hidden', marginBottom: 24, ...shadow },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.bg },
  rowLabel: { fontSize: 14, fontWeight: '700', color: colors.ink3 },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.ink1, opacity: 0.8 },
  
  logoutBtn: { padding: 18, borderRadius: 20, alignItems: 'center', borderWidth: 1.5, borderColor: colors.bg3, marginTop: 10 },
  logoutText: { fontSize: 15, fontWeight: '800', color: colors.red },
  version: { textAlign: 'center', marginTop: 24, fontSize: 12, color: colors.ink4, fontWeight: '600' },
});
