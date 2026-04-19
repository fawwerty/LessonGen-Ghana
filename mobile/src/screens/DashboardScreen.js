import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../utils/AuthContext';
import { colors } from '../utils/theme';
import { dashboardAPI } from '../services/api';

const C = colors;

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({ stats: { lessons: 0, schemes: 0, subscription: 'Free' }, recentLessons: [] });

  const loadData = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setData(res.data);
    } catch (err) {
      console.error('Dashboard Load Error:', err);
      // Don't crash — show empty state gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getUTCHours(); // Ghana is UTC+0
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Navigate to another tab
  const goToTab = (tabName) => navigation.navigate(tabName);

  // Navigate to a root-level stack screen (LessonView, Payment)
  const goToScreen = (screenName, params) => navigation.getParent()?.navigate(screenName, params);

  if (loading && !refreshing) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.g2} size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={s.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.g2} />}
    >
      {/* Header / Hero */}
      <View style={[s.hero, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={s.greeting}>{getGreeting()},</Text>
          <Text style={s.userName}>{user?.name?.split(' ')[0] || 'Teacher'} 👋</Text>
        </View>
        <TouchableOpacity style={s.avatar} onPress={() => goToTab('Profile')}>
          <Text style={s.avatarText}>{user?.name?.[0] || 'T'}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={s.statsGrid}>
        <View style={[s.statCard, { width: (width - 48) / 2 }]}>
          <Text style={s.statVal}>{data.stats?.lessons ?? 0}</Text>
          <Text style={s.statLbl}>Lessons</Text>
        </View>
        <View style={[s.statCard, { width: (width - 48) / 2 }]}>
          <Text style={s.statVal}>{data.stats?.schemes ?? 0}</Text>
          <Text style={s.statLbl}>Schemes</Text>
        </View>
        <TouchableOpacity 
          style={[s.statCard, s.statCardHighlight, { width: width - 40 }]}
          onPress={() => goToScreen('Payment')}
        >
          <View>
            <Text style={s.statLblHighlight}>MEMBERSHIP</Text>
            <Text style={s.statValHighlight}>{data.stats?.subscription ?? 'Free'}</Text>
          </View>
          <View style={s.badge}>
            <Text style={s.badgeText}>{data.stats?.subscription === 'PRO' ? 'Active' : 'Upgrade'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => goToTab('Generate')}>
            <View style={[s.actionIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="flash" size={24} color="#0284C7" />
            </View>
            <Text style={s.actionBtnText}>New Lesson</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={s.actionBtn} onPress={() => goToTab('Scheme')}>
            <View style={[s.actionIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="calendar" size={24} color="#16A34A" />
            </View>
            <Text style={s.actionBtnText}>Build Scheme</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionBtn} onPress={() => goToTab('My Lessons')}>
            <View style={[s.actionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="book" size={24} color="#D97706" />
            </View>
            <Text style={s.actionBtnText}>Archive</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>RECENT LESSONS</Text>
          <TouchableOpacity onPress={() => goToTab('My Lessons')}>
            <Text style={s.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {data.recentLessons.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No lessons generated yet.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => goToTab('Generate')}>
              <Text style={s.emptyBtnText}>Create your first lesson</Text>
            </TouchableOpacity>
          </View>
        ) : (
          data.recentLessons.map((item) => (
            <TouchableOpacity 
              key={item._id} 
              style={s.lessonItem}
              onPress={() => goToScreen('LessonView', { lesson: item })}
            >
              <View style={s.lessonIcon}>
                <Ionicons name="document-text" size={20} color={C.g2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.lessonTitle}>{item.subject}</Text>
                <Text style={s.lessonSub}>{item.classCode} · {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.bg3} />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 24
  },
  greeting: { fontSize: 14, color: C.ink3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  userName: { fontSize: 28, fontWeight: '900', color: C.g1, marginTop: 4 },
  avatar: { 
    width: 48, height: 48, borderRadius: 24, 
    backgroundColor: C.g4, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.g2
  },
  avatarText: { fontSize: 20, fontWeight: '900', color: C.g2 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 8, marginBottom: 32 },
  statCard: { 
    backgroundColor: C.bg, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: C.bg3
  },
  statCardHighlight: {
    backgroundColor: C.g1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  statVal: { fontSize: 24, fontWeight: '900', color: C.ink1 },
  statLbl: { fontSize: 13, color: C.ink3, marginTop: 4, fontWeight: '600' },
  statValHighlight: { fontSize: 22, fontWeight: '900', color: C.white, marginTop: 4 },
  statLblHighlight: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 1 },
  badge: { backgroundColor: C.gd, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '900', color: C.g1, textTransform: 'uppercase' },

  section: { paddingHorizontal: 20, marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: C.ink3, letterSpacing: 1 },
  viewAll: { fontSize: 13, fontWeight: '700', color: C.g2 },
  
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, alignItems: 'center' },
  actionIcon: { 
    width: '100%', aspectRatio: 1, borderRadius: 20, 
    alignItems: 'center', justifyContent: 'center', marginBottom: 8
  },
  actionBtnText: { fontSize: 12, fontWeight: '700', color: C.ink2 },

  lessonItem: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: C.white, padding: 14, borderRadius: 16,
    marginBottom: 10, borderWidth: 1, borderColor: C.bg3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  lessonIcon: { 
    width: 44, height: 44, borderRadius: 12, 
    backgroundColor: C.g4, alignItems: 'center', justifyContent: 'center', marginRight: 14
  },
  lessonIconText: { fontSize: 18, fontWeight: '900', color: C.g2 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: C.ink1 },
  lessonSub: { fontSize: 12, color: C.ink3, marginTop: 2 },
  arrow: { fontSize: 18, color: C.bg3, fontWeight: '600' },

  emptyCard: { 
    backgroundColor: C.bg, borderRadius: 20, padding: 30, alignItems: 'center',
    borderStyle: 'dashed', borderWidth: 2, borderColor: C.bg3
  },
  emptyText: { color: C.ink3, fontSize: 14, marginBottom: 20 },
  emptyBtn: { backgroundColor: C.g2, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: C.white, fontWeight: '700', fontSize: 14 }
});
