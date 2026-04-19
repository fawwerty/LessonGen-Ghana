import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../utils/theme';
import { lessonsAPI, exportAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function MyLessonsScreen({ navigation }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(null);
  const { user } = useAuth();
  const searchTimerRef = useRef(null);
  const insets = useSafeAreaInsets();

  const fetchLessons = async (q = '') => {
    try {
      const res = await lessonsAPI.list({ search: q });
      setLessons(res.data.lessons);
    } catch {
      Alert.alert('Error', 'Failed to load lessons');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchLessons(); }, []));

  const handleSearch = (text) => {
    setSearch(text);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => fetchLessons(text), 400);
  };

  const handleDownload = async (lesson) => {
    if (user?.plan === 'free' && user?.freeExportUsed) {
      Alert.alert('Upgrade Required', 'Upgrade to PRO for unlimited downloads.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => navigation.navigate('Payment') },
      ]);
      return;
    }
    setDownloading(lesson._id);
    try {
      const res = await exportAPI.docx(lesson._id);
      const filename = `LessonNote_${lesson.classCode}_T${lesson.term}_W${lesson.week}.docx`;
      const path = FileSystem.documentDirectory + filename;
      const b64 = Buffer.from(res.data).toString('base64');
      await FileSystem.writeAsStringAsync(path, b64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(path, {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dialogTitle: 'Open Lesson Note',
      });
    } catch (err) {
      if (err.response?.status === 402) navigation.navigate('Payment');
      else Alert.alert('Download Failed', 'Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Lesson', 'Are you sure you want to delete this lesson?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await lessonsAPI.delete(id); }
          catch { /* silent */ }
          setLessons(l => l.filter(x => x._id !== id));
        }
      },
    ]);
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderItem = ({ item: l }) => (
    <TouchableOpacity style={s.item} onPress={() => navigation.navigate('LessonView', { lesson: l })}>
      {/* Badge */}
      <View style={s.badge}>
        <Text style={s.badgeTop}>{l.classCode}</Text>
        <Text style={s.badgeSub}>{(l.subject || '').split(' ')[0].slice(0, 4)}</Text>
      </View>

      {/* Info */}
      <View style={s.info}>
        <Text style={s.infoTitle} numberOfLines={1}>{l.subject} · {l.classCode}</Text>
        <Text style={s.infoSub}>Term {l.term}, Week {l.week} · {fmt(l.createdAt)}</Text>
      </View>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity style={s.iconBtn} onPress={() => handleDownload(l)} disabled={downloading === l._id}>
          {downloading === l._id
            ? <ActivityIndicator size="small" color={colors.g2} />
            : <Text style={s.iconBtnText}>↓</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={[s.iconBtn, s.delBtn]} onPress={() => handleDelete(l._id)}>
          <Text style={s.delBtnText}>×</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[s.container, { paddingBottom: insets.bottom }]}>
      {/* Search */}
      <View style={s.searchBox}>
        <Text style={s.searchIcon}>⌕</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={handleSearch}
          placeholder="Search lessons..."
          placeholderTextColor={colors.ink4}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={s.clearBtn}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.g2} size="large" />
      ) : lessons.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}><Text style={s.emptyIconText}>◻</Text></View>
          <Text style={s.emptyTitle}>{search ? 'No results found' : 'No lessons yet'}</Text>
          <Text style={s.emptySub}>
            {search ? 'Try a different search term.' : 'Generate your first lesson from the Generate tab.'}
          </Text>
          {!search && (
            <TouchableOpacity style={s.genBtn} onPress={() => navigation.navigate('Generate')}>
              <Text style={s.genBtnText}>Generate First Lesson  →</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={lessons}
          renderItem={renderItem}
          keyExtractor={i => i._id}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchLessons(search); }}
              tintColor={colors.g2}
            />
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBox: {
    backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.bg3,
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  searchIcon: { fontSize: 16, color: colors.ink4 },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink },
  clearBtn: { fontSize: 20, color: colors.ink4, paddingHorizontal: 4 },
  list: { padding: 16, gap: 10, paddingBottom: 24 },
  item: {
    backgroundColor: colors.white, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: colors.bg3, ...shadow,
  },
  badge: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: colors.g4,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  badgeTop: { fontSize: 12, fontWeight: '800', color: colors.g1 },
  badgeSub: { fontSize: 9, color: colors.g2, fontWeight: '600' },
  info: { flex: 1, minWidth: 0 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 2 },
  infoSub: { fontSize: 11, color: colors.ink3 },
  actions: { flexDirection: 'row', gap: 6, flexShrink: 0 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10, borderWidth: 1.5,
    borderColor: colors.bg3, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.white,
  },
  iconBtnText: { fontSize: 16, color: colors.g2, fontWeight: '700' },
  delBtn: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  delBtnText: { fontSize: 20, color: '#B83232', fontWeight: '700', lineHeight: 22 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: colors.g4,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyIconText: { fontSize: 28, color: colors.g2 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.ink2, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.ink3, textAlign: 'center', lineHeight: 20 },
  genBtn: { backgroundColor: colors.gd, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 20 },
  genBtnText: { color: colors.g1, fontWeight: '800', fontSize: 14 },
});
