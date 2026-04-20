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
  bg: '#F8F6F0', bg3: '#E2DED4', red: '#B83232',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const insets = useSafeAreaInsets();


  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please check your credentials.';
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
                <Text style={s.cardTitle}>Sign In</Text>
                <Text style={s.cardSub}>LESSONGEN GHANA</Text>
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Fields */}
            <View style={s.field}>
              <Text style={s.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="teacher@school.edu.gh"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={C.ink4}
              />
            </View>
            <View style={s.field}>
              <Text style={s.label}>PASSWORD</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                placeholderTextColor={C.ink4}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[s.btn, loading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Sign In  →</Text>
              )}
            </TouchableOpacity>

            {/* Register link */}
            <TouchableOpacity
              style={s.linkRow}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={s.linkText}>
                No account?{'  '}
                <Text style={s.linkAccent}>Register here</Text>
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,20,12,0.58)' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' },
  backBtn: {
    alignSelf: 'flex-start', marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  backBtnText: { color: C.white, fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 28, padding: 26,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25, shadowRadius: 40, elevation: 16,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  logoBadge: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.gd, alignItems: 'center', justifyContent: 'center',
    shadowColor: C.gd, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  logoText: { fontSize: 22, fontWeight: '900', color: C.g1 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: C.g1 },
  cardSub: { fontSize: 10, fontWeight: '700', color: C.ink3, letterSpacing: 1.2, marginTop: 1 },
  errorBox: {
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
  },
  errorText: { color: '#B83232', fontSize: 13, fontWeight: '500' },
  field: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: C.ink3, letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: 'rgba(248,246,240,0.7)', borderWidth: 1.5, borderColor: C.bg3,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.ink,
  },
  btn: {
    backgroundColor: '#111827', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  btnText: { color: C.white, fontSize: 15, fontWeight: '800' },
  linkRow: { marginTop: 18, alignItems: 'center', marginBottom: 20 },
  linkText: { fontSize: 13, color: C.ink3, fontWeight: '500' },
  linkAccent: { color: C.gd, fontWeight: '700' },
  statusRow: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' 
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700', color: C.ink4, letterSpacing: 0.5 },
  retryText: { fontSize: 11, fontWeight: '800', color: '#3B82F6', marginLeft: 4 },
});
