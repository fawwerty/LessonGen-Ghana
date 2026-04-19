import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground, Dimensions, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const C = {
  g1: '#0D3B22', g2: '#1A6B3C', g3: '#2E8B57', g4: '#D4EDE0',
  gd: '#C8971A', gl: '#FFF3CC', gb: '#8A6510',
  white: '#FFFFFF', ink: '#1A1814', ink2: '#3D3A30', ink3: '#6B6759',
  bg: '#F8F6F0', bg3: '#E2DED4',
};

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  // Safe calculation for grid items
  const cardWidth = Math.max((width - 80) / 4 - 6, 60);

  return (
    <ImageBackground
      source={require('../../assets/bg.png')}
      style={s.bg}
      resizeMode="cover"
    >
      <View style={s.overlay} />
      <StatusBar style="light" />
      <SafeAreaView style={s.safe}>
        {/* Header Brand */}
        <View style={s.header}>
          <View style={s.logoBadge}>
            <Text style={s.logoIcon}>L</Text>
          </View>
          <Text style={s.brand}>LessonGen Ghana</Text>
        </View>

        {/* Hero Content */}
        <View style={s.heroCard}>
          <Text style={s.headline}>
            Smarter Lesson Notes{'\n'}
            <Text style={s.headlineAccent}>In Seconds.</Text>
          </Text>
          <Text style={s.sub}>
            The AI tool for Ghanaian teachers. Generate NaCCA-compliant lesson notes and export print-ready DOCX files instantly.
          </Text>

          {/* Stat Badges */}
          <View style={s.statsRow}>
            {[['100%', 'NaCCA'], ['3-Step', 'Wizard'], ['B&W', 'Print'], ['AI', 'Powered']].map(([val, lbl]) => (
              <View key={lbl} style={[s.statCard, { minWidth: cardWidth }]}>
                <Text style={s.statVal}>{val}</Text>
                <Text style={s.statLbl}>{lbl}</Text>
              </View>
            ))}
          </View>

          {/* CTA Buttons */}
          <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={s.primaryBtnText}>Start Generating Free  →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={s.secondaryBtnText}>Sign In to Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Pills */}
        <View style={s.featRow}>
          {[
            { icon: '⚡', label: 'Insta-Generate' },
            { icon: '☁', label: 'NaCCA Aligned' },
            { icon: '⬇', label: 'DOCX Export' },
          ].map(f => (
            <View key={f.label} style={s.featPill}>
              <Text style={s.featIcon}>{f.icon}</Text>
              <Text style={s.featLabel}>{f.label}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,20,12,0.62)' },
  safe: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, marginBottom: 24 },
  logoBadge: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.gd, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  logoIcon: { fontSize: 18, fontWeight: '900', color: C.g1 },
  brand: { fontSize: 17, fontWeight: '800', color: C.white },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 28, padding: 24,
    marginBottom: 20,
  },
  headline: { fontSize: 30, fontWeight: '900', color: C.white, lineHeight: 38, marginBottom: 14 },
  headlineAccent: { color: '#6EE7B7' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.82)', lineHeight: 20, marginBottom: 20, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', padding: 10, alignItems: 'center',
  },
  statVal: { fontSize: 14, fontWeight: '900', color: C.white },
  statLbl: { fontSize: 9, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 },
  primaryBtn: {
    backgroundColor: '#059669', borderRadius: 16, paddingVertical: 15,
    alignItems: 'center', marginBottom: 10,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  primaryBtnText: { color: C.white, fontSize: 15, fontWeight: '800' },
  secondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryBtnText: { color: C.white, fontSize: 15, fontWeight: '700' },
  featRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  featPill: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 12, alignItems: 'center',
  },
  featIcon: { fontSize: 18, color: '#6EE7B7', marginBottom: 4 },
  featLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5 },
});
