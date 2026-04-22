import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, useWindowDimensions, RefreshControl 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../utils/AuthContext';
import { colors, shadow } from '../utils/theme';
import { dashboardAPI } from '../services/api';

const C = colors;

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({ 
    stats: { lessons: 0, schemes: 0, subscription: 'Free', hitRate: '0%' }, 
    recentLessons: [] 
  });

  const loadData = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setData(res.data);
    } catch (err) {
      console.error('Dashboard Load Error:', err);
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

  const goToTab = (tabName) => navigation.navigate(tabName);
  const goToScreen = (screenName, params) => navigation.getParent()?.navigate(screenName, params);

  if (loading && !refreshing) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.g2} size="large" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Header - Improved Structure */}
      <View style={[s.header, { paddingTop: insets.top + 20 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={s.title}>LessonGen</Text>
            <Text style={s.subtitle}>Smart Lesson Planning for Ghana</Text>
          </View>
          <TouchableOpacity style={s.profileTrigger} onPress={() => goToTab('Profile')}>
            <View style={s.avatarSmall}>
              <Text style={s.avatarTextSmall}>{user?.name?.[0] || 'T'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.g2} />}
      >
        {/* KPI Cards Grid - 2x2 Structure */}
        <View style={s.cardRow}>
          <Card title="Lessons Created" value={data.stats?.lessons ?? 0} />
          <Card title="Cache Hit Rate" value={data.stats?.hitRate ?? '0%'} />
        </View>

        <View style={s.cardRow}>
          <Card title="Saved Schemes" value={data.stats?.schemes ?? 0} />
          <TouchableOpacity 
            style={[s.card, { backgroundColor: C.g1, borderColor: C.g1 }]} 
            onPress={() => goToScreen('Payment')}
          >
            <Text style={[s.cardTitle, { color: 'rgba(255,255,255,0.7)' }]}>Active Plan</Text>
            <Text style={[s.cardValue, { color: C.white }]}>{data.stats?.subscription ?? 'FREE'}</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Generate Button - Styled Like Snippet */}
        <TouchableOpacity style={s.generateBtn} onPress={() => goToTab('Generate')}>
          <Text style={s.generateText}>Generate New Lesson</Text>
          <Ionicons name="flash" size={18} color={C.white} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {/* Recent Activity Section */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => goToTab('My Lessons')}>
            <Text style={s.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {data.recentLessons.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyText}>No recent generations found.</Text>
            <Text style={{ fontSize: 11, color: C.ink4, marginTop: 4 }}>Your lesson history will appear here.</Text>
          </View>
        ) : (
          data.recentLessons.slice(0, 5).map((item) => (
            <TouchableOpacity 
              key={item._id} 
              style={s.activityCard}
              onPress={() => goToScreen('LessonView', { lesson: item })}
            >
              <View style={s.activityIconWrap}>
                <Ionicons name="document-text" size={20} color={C.g2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.activityText} numberOfLines={1}>{item.subject} - Week {item.week}</Text>
                <Text style={s.activitySub}>{item.classCode} · {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.bg3} />
            </TouchableOpacity>
          ))
        )}

        {/* Membership Promo (Conditional) */}
        {data.stats?.subscription !== 'PRO' && (
          <TouchableOpacity style={s.promoCard} onPress={() => goToScreen('Payment')}>
            <View style={{ flex: 1 }}>
              <Text style={s.promoTitle}>Upgrade to PRO</Text>
              <Text style={s.promoSub}>Get unlimited DOCX exports and faster AI generation.</Text>
            </View>
            <View style={s.promoBadge}>
              <Text style={s.promoBadgeText}>UPGRADE</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

function Card({ title, value }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.cardValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.g1,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.ink3,
    fontWeight: '700',
    marginTop: -2,
  },
  profileTrigger: {
    padding: 2,
  },
  avatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.g4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.g2,
  },
  avatarTextSmall: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.g2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    width: '48%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.bg3,
    ...shadow,
  },
  cardTitle: {
    fontSize: 11,
    color: colors.ink4,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.g1,
    marginTop: 6,
  },
  generateBtn: {
    marginTop: 15,
    backgroundColor: colors.g2,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.g2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  generateText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.ink2,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.g2,
  },
  activityCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.bg3,
    ...shadow,
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.g4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink1,
  },
  activitySub: {
    fontSize: 12,
    color: colors.ink3,
    marginTop: 3,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: colors.bg3,
  },
  emptyText: {
    color: colors.ink2,
    fontSize: 14,
    fontWeight: '700',
  },
  promoCard: {
    marginTop: 20,
    backgroundColor: colors.gl,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gd,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.gb,
  },
  promoSub: {
    fontSize: 12,
    color: colors.gb,
    marginTop: 2,
    opacity: 0.8,
  },
  promoBadge: {
    backgroundColor: colors.gb,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 12,
  },
  promoBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.white,
  },
});
