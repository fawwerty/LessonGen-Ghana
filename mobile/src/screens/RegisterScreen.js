import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
  ImageBackground, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../utils/AuthContext';
import { authAPI } from '../services/api';

const C = {
  g1: '#0D3B22', g2: '#1A6B3C', gd: '#C8971A', gb: '#8A6510',
  white: '#FFFFFF', ink: '#1A1814', ink3: '#6B6759', ink4: '#9A9890',
  bg: '#F8F6F0', bg3: '#E2DED4',
};

const FIELDS = [
  { key: 'name',     label: 'Full Name',     placeholder: 'Mr. Kofi Mensah',              secure: false, keyboard: 'default',        cap: 'words' },
  { key: 'email',    label: 'Email Address', placeholder: 'teacher@school.edu.gh',         secure: false, keyboard: 'email-address',  cap: 'none'  },
  { key: 'school',   label: 'School Name',   placeholder: 'Accra Academy Basic School',    secure: false, keyboard: 'default',        cap: 'words' },
  { key: 'password', label: 'Password',      placeholder: '••••••••',                     secure: true,  keyboard: 'default',        cap: 'none'  },
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', school: '', password: '', role: 'teacher' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const insets = useSafeAreaInsets();


  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    const { name, email, school, password } = form;
    if (!name || !email || !school || !password) {
      setError('Please fill in all fields.'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ ...form, email: form.email.trim().toLowerCase() });
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/bg.png')}
      style={s.bg}
      resizeMode="cover"
    >
      <View style={s.overlay} />
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={s.backBtnText}>← Home</Text>
          </TouchableOpacity>

          {/* Card */}
          <View style={s.card}>
            {/* Logo */}
            <View style={s.logoRow}>
              <View style={s.logoBadge}>
                <Text style={s.logoText}>L</Text>
              </View>
              <View>
                <Text style={s.cardTitle}>Create Account</Text>
                <Text style={s.cardSub}>JOIN THOUSANDS OF TEACHERS</Text>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Fields */}
            {FIELDS.map(f => (
              <View style={s.field} key={f.key}>
                <Text style={s.label}>{f.label.toUpperCase()}</Text>
                <TextInput
                  style={s.input}
                  value={form[f.key]}
                  onChangeText={v => set(f.key, v)}
                  placeholder={f.placeholder}
                  secureTextEntry={f.secure}
                  keyboardType={f.keyboard}
                  autoCapitalize={f.cap}
                  autoCorrect={false}
                  placeholderTextColor={C.ink4}
                />
              </View>
            ))}

            {/* Role Picker */}
            <View style={s.field}>
              <Text style={s.label}>ROLE</Text>
              <View style={s.roleRow}>
                {[['teacher', 'Teacher'], ['school_admin', 'School Admin']].map(([val, lbl]) => (
                  <TouchableOpacity
                    key={val}
                    style={[s.rolePill, form.role === val && s.rolePillActive]}
                    onPress={() => set('role', val)}
                  >
                    <Text style={[s.rolePillText, form.role === val && s.rolePillTextActive]}>{lbl}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Create Account  →</Text>
              )}
            </TouchableOpacity>

            {/* Login link */}
            <TouchableOpacity style={s.linkRow} onPress={() => navigation.navigate('Login')}>
              <Text style={s.linkText}>
                Already registered?{'  '}
                <Text style={s.linkAccent}>Sign in</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,20,12,0.60)' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },
  backBtn: {
    alignSelf: 'flex-start', marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  backBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 28, padding: 26,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25, shadowRadius: 40, elevation: 16,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  logoBadge: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#1A6B3C', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1A6B3C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  logoText: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#0D3B22' },
  cardSub: { fontSize: 9, fontWeight: '700', color: '#6B6759', letterSpacing: 1.0, marginTop: 2 },
  errorBox: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
  },
  errorText: { color: '#B83232', fontSize: 13, fontWeight: '500' },
  field: { marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '700', color: '#6B6759', letterSpacing: 0.8, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(248,246,240,0.7)', borderWidth: 1.5, borderColor: '#E2DED4',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1A1814',
  },
  roleRow: { flexDirection: 'row', gap: 10 },
  rolePill: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E2DED4', alignItems: 'center',
    backgroundColor: 'rgba(248,246,240,0.7)',
  },
  rolePillActive: { borderColor: '#1A6B3C', backgroundColor: '#D4EDE0' },
  rolePillText: { fontSize: 13, fontWeight: '600', color: '#6B6759' },
  rolePillTextActive: { color: '#0D3B22', fontWeight: '800' },
  btn: {
    backgroundColor: '#1A6B3C', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 10,
    shadowColor: '#1A6B3C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  linkRow: { marginTop: 18, alignItems: 'center', marginBottom: 20 },
  linkText: { fontSize: 13, color: '#6B6759', fontWeight: '500' },
  linkAccent: { color: '#1A6B3C', fontWeight: '700' },
  statusRow: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' 
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', color: '#9A9890', letterSpacing: 0.5 },
  retryText: { fontSize: 11, fontWeight: '800', color: '#3B82F6', marginLeft: 4 },
});
