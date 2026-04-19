import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';
import { useAuth } from '../utils/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'T';

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: colors.bg, flexGrow: 1 }}>
      <View style={s.avatarBox}>
        <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.school}>{user?.school}</Text>
        <View style={[s.planBadge, user?.plan !== 'free' && { backgroundColor: '#ede9fe' }]}>
          <Text style={[s.planText, user?.plan !== 'free' && { color: '#5b21b6' }]}>
            {user?.plan === 'free' ? 'FREE PLAN' : '⭐ PRO PLAN'}
          </Text>
        </View>
      </View>

      <View style={s.infoCard}>
        {[['Email', user?.email], ['School', user?.school], ['Role', user?.role],
          ['Plan', user?.plan?.toUpperCase()]].map(([k, v]) => (
          <View key={k} style={s.row}>
            <Text style={s.rowKey}>{k}</Text>
            <Text style={s.rowVal}>{v || '—'}</Text>
          </View>
        ))}
      </View>

      {user?.plan === 'free' && (
        <TouchableOpacity style={s.upgradeBtn} onPress={() => navigation.navigate('Payment')}>
          <Text style={s.upgradeText}>⭐ Upgrade to PRO — GHS 25/month</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>Unlimited DOCX exports · Priority generation</Text>
        </TouchableOpacity>
      )}

      <View style={s.infoCard}>
        <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Generate')}>
          <Text style={s.rowKey}>✨ Generate</Text><Text style={s.rowLink}>New lesson →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.row} onPress={() => navigation.navigate('My Lessons')}>
          <Text style={s.rowKey}>📚 My Lessons</Text><Text style={s.rowLink}>View all →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={{ textAlign: 'center', fontSize: 12, color: colors.ink4, marginTop: 20 }}>
        LessonGen Ghana v1.0.0{'\n'}NaCCA-Aligned AI Lesson Planning
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  avatarBox: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.gd, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.g1 },
  name: { fontSize: 20, fontWeight: '700', color: colors.g1 },
  school: { fontSize: 13, color: colors.ink3, marginTop: 4, textAlign: 'center' },
  planBadge: { marginTop: 10, backgroundColor: colors.g4, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  planText: { fontSize: 12, fontWeight: '700', color: colors.g2 },
  infoCard: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.bg3, marginBottom: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.bg3, padding: 14, alignItems: 'center' },
  rowKey: { width: 110, fontSize: 13, fontWeight: '600', color: colors.ink3 },
  rowVal: { flex: 1, fontSize: 13, color: colors.ink2 },
  rowLink: { fontSize: 13, color: colors.g2, fontWeight: '600' },
  upgradeBtn: { backgroundColor: colors.gd, borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 16 },
  upgradeText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  logoutBtn: { borderWidth: 1.5, borderColor: colors.bg3, borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 8 },
  logoutText: { color: colors.red, fontSize: 14, fontWeight: '600' },
});
