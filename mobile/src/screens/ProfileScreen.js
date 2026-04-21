import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../utils/AuthContext';

const C = {
  g1: '#0D3B22', g2: '#1A6B3C', g4: '#D4EDE0', gd: '#C8971A', gl: '#FFF3CC',
  white: '#FFFFFF', ink: '#1A1814', ink2: '#3D3A30', ink3: '#6B6759', ink4: '#9A9890',
  bg: '#F8F6F0', bg2: '#F0EDE4', bg3: '#E2DED4', red: '#B83232',
};
const shadow = { shadowColor: C.g1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 };

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'T';

  const isPro = user?.plan !== 'free';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar Header */}
      <View style={s.header}>
        <View style={[s.avatar, isPro && s.avatarPro]}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.school} numberOfLines={2}>{user?.school}</Text>
        <View style={[s.planBadge, isPro && s.planBadgePro]}>
          <Text style={[s.planText, isPro && s.planTextPro]}>
            {isPro ? '+ PRO PLAN' : 'FREE PLAN'}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={s.statsRow}>
        {[['12', 'Subjects'], ['KG-JHS3', 'Levels'], ['NaCCA', 'Standard']].map(([v, l]) => (
          <View key={l} style={s.statCard}>
            <Text style={s.statVal}>{v}</Text>
            <Text style={s.statLbl}>{l}</Text>
          </View>
        ))}
      </View>

      {/* Info Card */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>ACCOUNT DETAILS</Text>
        <View style={s.card}>
          {[
            ['Email', user?.email],
            ['School', user?.school],
            ['Role', user?.role ? user.role.replace('_', ' ') : '—'],
            ['Plan', user?.plan?.toUpperCase() || '—'],
          ].filter(([,v]) => v).map(([k, v], i, arr) => (
            <View key={k} style={[s.row, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={s.rowKey}>{k}</Text>
              <Text style={s.rowVal} numberOfLines={1}>{v}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Upgrade Banner */}
      {!isPro && (
        <TouchableOpacity style={s.upgradeBanner} onPress={() => navigation.navigate('Payment')}>
          <View>
            <Text style={s.upgradeTitle}>Upgrade to PRO</Text>
            <Text style={s.upgradeSub}>Unlimited DOCX exports · Batch generation</Text>
          </View>
          <Text style={s.upgradeArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Generate')}>
            <Text style={s.rowKey}>Generate</Text>
            <Text style={s.rowLink}>New lesson →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.row} onPress={() => navigation.navigate('My Lessons')}>
            <Text style={s.rowKey}>My Lessons</Text>
            <Text style={s.rowLink}>View all →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('About')}>
            <Text style={s.rowKey}>About LessonGen</Text>
            <Text style={s.rowLink}>Read story →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={s.footer}>LessonGen Ghana · NaCCA-Aligned AI</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content: { padding: 20, paddingTop: 16 },
  header: { alignItems: 'center', paddingVertical: 16, marginBottom: 20 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.gd, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, ...shadow,
  },
  avatarPro: { backgroundColor: C.g2 },
  avatarText: { fontSize: 28, fontWeight: '800', color: C.g1 },
  name: { fontSize: 20, fontWeight: '800', color: C.g1, marginBottom: 4 },
  school: { fontSize: 13, color: C.ink3, textAlign: 'center', marginBottom: 10, paddingHorizontal: 20 },
  planBadge: { backgroundColor: C.g4, paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20 },
  planBadgePro: { backgroundColor: '#EDE9FE' },
  planText: { fontSize: 12, fontWeight: '800', color: C.g2, letterSpacing: 0.5 },
  planTextPro: { color: '#5B21B6' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: C.white, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: C.bg3, ...shadow,
  },
  statVal: { fontSize: 16, fontWeight: '800', color: C.g1, marginBottom: 2 },
  statLbl: { fontSize: 10, color: C.ink4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: C.ink4, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginLeft: 2 },
  card: { backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.bg3, overflow: 'hidden', ...shadow },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderColor: C.bg3 },
  rowKey: { fontSize: 13, fontWeight: '600', color: C.ink3, flex: 1 },
  rowVal: { fontSize: 13, color: C.ink2, fontWeight: '500', flex: 2, textAlign: 'right' },
  rowLink: { fontSize: 13, color: C.g2, fontWeight: '700' },
  upgradeBanner: {
    backgroundColor: C.gd, borderRadius: 16, padding: 18, marginBottom: 18,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    ...shadow, shadowColor: C.gd, shadowOpacity: 0.35,
  },
  upgradeTitle: { color: C.g1, fontWeight: '800', fontSize: 15 },
  upgradeSub: { color: 'rgba(13,59,34,0.75)', fontSize: 12, marginTop: 3 },
  upgradeArrow: { color: C.g1, fontSize: 22, fontWeight: '800' },
  logoutBtn: {
    borderWidth: 1.5, borderColor: C.bg3, borderRadius: 14, padding: 14,
    alignItems: 'center', marginBottom: 16,
  },
  logoutText: { color: C.red, fontSize: 14, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 11, color: C.ink4, marginTop: 4 },
});
