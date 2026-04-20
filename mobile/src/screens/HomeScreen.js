import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

const C = {
  g1: '#0D3B22', g2: '#1A6B3C', g3: '#2E8B57', g4: '#D4EDE0',
  gd: '#C8971A', gl: '#FFF3CC', gb: '#8A6510',
  white: '#FFFFFF', ink: '#1A1814', ink2: '#3D3A30', ink3: '#6B6759',
  bg: '#F8F6F0', bg3: '#E2DED4',
};

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <ImageBackground
      source={require('../../assets/bg.png')}
      style={s.bg}
      resizeMode="cover"
    >
      <View style={[s.overlay, { backgroundColor: isDark ? 'rgba(5,20,12,0.78)' : 'rgba(5,20,12,0.55)' }]} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <SafeAreaView style={s.safe}>
        {/* Top Header Row */}
        <View style={s.header}>
          <View style={s.brandGroup}>
            <View style={[s.logoBadge, { backgroundColor: isDark ? C.gd : C.g1 }]}>
              <Text style={[s.logoIcon, { color: isDark ? C.g1 : C.white }]}>L</Text>
            </View>
            <Text style={[s.brand, { color: C.white }]}>LessonGen</Text>
          </View>

          <View style={s.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={s.iconBtn}>
              <Ionicons 
                name={isDark ? 'sunny' : 'moon'} 
                size={22} 
                color={isDark ? '#FCD34D' : '#FDE68A'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.signInLink}>
              <Text style={[s.signInText, { color: C.white }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Content (Floating) */}
        <View style={s.content}>
          <View style={s.heroTextGroup}>
            <Text style={[s.headline, { color: C.white }]}>
              Smarter Lesson Notes{'\n'}
              <Text style={s.headlineAccent}>In Seconds.</Text>
            </Text>
            <Text style={[s.sub, { color: 'rgba(255,255,255,0.95)' }]}>
              The AI tool for Ghanaian educators. Generate NaCCA-compliant plans and export DOCX files instantly.
            </Text>
          </View>

          {/* Centered CTA - Pushed Down */}
          <View style={s.ctaWrapper}>
            <TouchableOpacity 
              style={[s.primaryBtn, !isDark && { backgroundColor: C.g1 }]} 
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={s.primaryBtnText}>Start Registration Free  →</Text>
            </TouchableOpacity>
            <Text style={[s.disclaimer, { color: 'rgba(255,255,255,0.7)' }]}>
              Join 5,000+ teachers across Ghana today.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1, paddingHorizontal: 24 },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingTop: 12, 
    height: 60,
  },
  brandGroup: { flexDirection: 'row', alignItems: 'center' },
  logoBadge: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  logoIcon: { fontSize: 18, fontWeight: '900' },
  brand: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },

  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBtn: { 
    width: 36, height: 36, borderRadius: 18, 
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  signInLink: { paddingVertical: 4 },
  signInText: { fontSize: 15, fontWeight: '800' },

  content: { flex: 1, justifyContent: 'center', paddingTop: 100 },
  
  heroTextGroup: { marginBottom: 120 },
  headline: { 
    fontSize: 42, fontWeight: '900', lineHeight: 48, marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10,
  },
  headlineAccent: { color: '#10B981' },
  sub: { 
    fontSize: 16, lineHeight: 24, fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },

  ctaWrapper: { alignItems: 'center', marginTop: 20 },
  primaryBtn: {
    backgroundColor: '#059669', width: '100%', borderRadius: 20, paddingVertical: 18,
    alignItems: 'center', marginBottom: 16,
    shadowColor: '#059669', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
  },
  primaryBtnText: { color: C.white, fontSize: 17, fontWeight: '900' },
  disclaimer: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
});
