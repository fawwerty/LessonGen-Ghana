import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../utils/theme';
import { useAuth } from '../utils/AuthContext';

// ── Register Screen ──────────────────────────────────────────────────────────
export function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name:'', email:'', school:'', password:'', role:'teacher' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.school || !form.password) {
      Alert.alert('Error', 'Please fill all fields.'); return;
    }
    setLoading(true);
    try { await register(form); }
    catch (err) { Alert.alert('Registration Failed', err.response?.data?.message || 'Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.card}>
        <Text style={s.title}>Create Account</Text>
        <Text style={s.sub}>Join thousands of Ghanaian teachers</Text>
        {[['Full Name','name','Mr. Kofi Mensah',false,false],
          ['Email','email','teacher@school.edu.gh',false,true],
          ['School Name','school','Accra Academy Basic School',false,false],
          ['Password','password','••••••••',true,false]].map(([lbl,key,ph,sec,email]) => (
          <View style={s.field} key={key}>
            <Text style={s.label}>{lbl.toUpperCase()}</Text>
            <TextInput style={s.input} value={form[key]} onChangeText={v => set(key, v)}
              placeholder={ph} secureTextEntry={sec} keyboardType={email ? 'email-address' : 'default'}
              autoCapitalize={email||sec ? 'none' : 'words'} placeholderTextColor={colors.ink4} />
          </View>
        ))}
        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account →</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: colors.ink3, fontSize: 13 }}>Already registered? <Text style={{ color: colors.g2, fontWeight: '700' }}>Sign in</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── Profile Screen ────────────────────────────────────────────────────────────
export function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'T';

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={p.avatarBox}>
        <View style={p.avatar}><Text style={p.avatarText}>{initials}</Text></View>
        <Text style={p.name}>{user?.name}</Text>
        <Text style={p.school}>{user?.school}</Text>
        <View style={p.planBadge}>
          <Text style={p.planText}>{user?.plan === 'free' ? 'FREE PLAN' : 'PRO PLAN'}</Text>
        </View>
      </View>

      <View style={p.infoCard}>
        {[['Email', user?.email], ['School', user?.school], ['Role', user?.role], ['Member since', new Date(user?.createdAt||Date.now()).toLocaleDateString('en-GH')]].map(([k, v]) => (
          <View key={k} style={p.row}>
            <Text style={p.rowKey}>{k}</Text>
            <Text style={p.rowVal}>{v}</Text>
          </View>
        ))}
      </View>

      {user?.plan === 'free' && (
        <TouchableOpacity style={p.upgradeBtn} onPress={() => navigation.navigate('Payment')}>
          <Text style={p.upgradeText}>⭐ Upgrade to PRO — GHS 25/month</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={p.logoutBtn} onPress={logout}>
        <Text style={p.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.g1, padding: 24, justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: colors.g1, textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: colors.ink3, textAlign: 'center', marginBottom: 20 },
  field: { marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '700', color: colors.ink3, letterSpacing: 0.6, marginBottom: 5 },
  input: { backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.bg3, borderRadius: 8, padding: 12, fontSize: 14, color: colors.ink },
  btn: { backgroundColor: colors.g2, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
const p = StyleSheet.create({
  avatarBox: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.gd, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700', color: colors.g1 },
  name: { fontSize: 20, fontWeight: '700', color: colors.g1 },
  school: { fontSize: 13, color: colors.ink3, marginTop: 4 },
  planBadge: { marginTop: 8, backgroundColor: colors.g4, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  planText: { fontSize: 12, fontWeight: '700', color: colors.g2 },
  infoCard: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.bg3, marginBottom: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.bg3, padding: 12 },
  rowKey: { width: 110, fontSize: 12, fontWeight: '700', color: colors.ink3 },
  rowVal: { flex: 1, fontSize: 13, color: colors.ink2 },
  upgradeBtn: { backgroundColor: colors.gd, borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 12 },
  upgradeText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  logoutBtn: { borderWidth: 1.5, borderColor: colors.bg3, borderRadius: 10, padding: 14, alignItems: 'center' },
  logoutText: { color: colors.red, fontSize: 14, fontWeight: '600' },
});

export default RegisterScreen;
