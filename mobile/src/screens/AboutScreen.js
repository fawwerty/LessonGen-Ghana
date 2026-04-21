import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

const shadow = { shadowColor: colors.g1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 };

export default function AboutScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const stats = [
    { label: 'Teaching', val: '4+ Years', color: colors.g2 },
    { label: 'Specialization', val: 'ML/Dev', color: '#2563EB' }
  ];

  const portfolio = [
    { title: 'CyberShield-AI', sub: 'ML-powered intrusion detection system.', icon: 'shield-checkmark', color: colors.g2 },
    { title: 'Bankly App', sub: 'Secure mobile banking solution.', icon: 'business', color: '#2563EB' },
    { title: 'SecureX (GRC)', sub: 'Enterprise Cybersecurity platform.', icon: 'construct', color: '#D97706' }
  ];

  return (
    <ScrollView 
      style={s.container} 
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.hero}>
        <Text style={s.heroTitle}>Bridging Classrooms & <Text style={{ color: colors.g2 }}>Code.</Text></Text>
        <Text style={s.heroSub}>MEET THE FOUNDER: A professional educator and software engineer dedicated to modernizing Ghanaian education through AI.</Text>
      </View>

      <View style={s.card}>
        <View style={s.badge}><Text style={s.badgeText}>THE FOUNDER'S JOURNEY</Text></View>
        <Text style={s.cardTitle}>From the Chalkboard to the Codebase.</Text>
        <Text style={s.cardText}>
          Since February 2020, I have served as a Basic School Teacher in Ghana. My daily experience revealed a critical gap: teachers spend hours on paperwork that could be automated.
        </Text>
        <Text style={s.cardText}>
          I built LessonGen Ghana to be the bridge between traditional pedagogy and the future of AI.
        </Text>
        
        <View style={s.founderBox}>
          <View style={s.avatar}><Ionicons name="globe-outline" size={32} color={colors.g2} /></View>
          <Text style={s.founderName}>Fawwerty</Text>
          <Text style={s.founderRole}>Founder & Lead Engineer</Text>
          <View style={s.statsRow}>
            {stats.map(st => (
              <View key={st.label} style={s.statBox}>
                <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Engineering Portfolio</Text>
        {portfolio.map(p => (
          <View key={p.title} style={s.portfolioCard}>
            <View style={[s.pIcon, { backgroundColor: p.color + '15' }]}>
              <Ionicons name={p.icon} size={20} color={p.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.pTitle}>{p.title}</Text>
              <Text style={s.pSub}>{p.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={s.cta}>
        <Text style={s.ctaTitle}>Experience the Teacher's Advantage</Text>
        <Text style={s.ctaSub}>Build lesson notes that truly comply with NaCCA standards.</Text>
        <TouchableOpacity style={s.ctaBtn} onPress={() => navigation.navigate('Generate')}>
          <Text style={s.ctaBtnText}>Start Generating</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.footer}>LessonGen Ghana · Designed with ❤️ for Teachers</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  hero: { marginTop: 20, marginBottom: 32, alignItems: 'center' },
  heroTitle: { fontSize: 32, fontWeight: '900', color: colors.g1, textAlign: 'center', lineHeight: 40, marginBottom: 12 },
  heroSub: { fontSize: 15, color: colors.ink3, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 20, ...shadow, marginBottom: 32 },
  badge: { backgroundColor: colors.g4, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 12 },
  badgeText: { fontSize: 10, fontWeight: '800', color: colors.g2, letterSpacing: 0.5 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: colors.g1, marginBottom: 12 },
  cardText: { fontSize: 14, color: colors.ink2, lineHeight: 22, marginBottom: 12 },
  founderBox: { backgroundColor: colors.bg2, borderRadius: 20, padding: 20, marginTop: 10, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginBottom: 12, ...shadow },
  founderName: { fontSize: 18, fontWeight: '800', color: colors.g1 },
  founderRole: { fontSize: 11, fontWeight: '700', color: colors.g2, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 20, width: '100%' },
  statBox: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 12, alignItems: 'center' },
  statVal: { fontSize: 13, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '700', color: colors.ink4, textTransform: 'uppercase', marginTop: 4 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.g1, marginBottom: 16 },
  portfolioCard: { flexDirection: 'row', gap: 16, backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', ...shadow },
  pIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pTitle: { fontSize: 15, fontWeight: '700', color: colors.g1 },
  pSub: { fontSize: 12, color: colors.ink3, marginTop: 2 },
  cta: { backgroundColor: colors.g1, borderRadius: 32, padding: 32, alignItems: 'center' },
  ctaTitle: { color: colors.white, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  ctaSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', marginBottom: 24 },
  ctaBtn: { backgroundColor: colors.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  ctaBtnText: { color: colors.g1, fontWeight: '800', fontSize: 14 },
  footer: { textAlign: 'center', color: colors.ink4, fontSize: 11, marginTop: 20 },
});
