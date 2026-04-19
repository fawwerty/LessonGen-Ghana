import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { colors } from '../utils/theme';
import { useAuth } from '../utils/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please enter email and password'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.card}>
        <View style={s.logoBox}><Text style={s.logoEmoji}>📚</Text></View>
        <Text style={s.title}>LessonGen Ghana</Text>
        <Text style={s.sub}>NaCCA-Aligned AI Lesson Planning</Text>

        <View style={s.field}>
          <Text style={s.label}>EMAIL ADDRESS</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="teacher@school.edu.gh" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.ink4} />
        </View>
        <View style={s.field}>
          <Text style={s.label}>PASSWORD</Text>
          <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry placeholderTextColor={colors.ink4} />
        </View>

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign In →</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: colors.ink3, fontSize: 13 }}>No account? <Text style={{ color: colors.g2, fontWeight: '700' }}>Register here</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.g1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 },
  logoBox: { width: 64, height: 64, backgroundColor: colors.gd, borderRadius: 16, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14 },
  logoEmoji: { fontSize: 28 },
  title: { textAlign: 'center', fontSize: 22, fontWeight: '700', color: colors.g1, marginBottom: 4 },
  sub: { textAlign: 'center', fontSize: 13, color: colors.ink3, marginBottom: 24 },
  field: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: colors.ink3, letterSpacing: 0.6, marginBottom: 5, textTransform: 'uppercase' },
  input: { backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.bg3, borderRadius: 8, padding: 12, fontSize: 14, color: colors.ink },
  btn: { backgroundColor: colors.g2, borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
