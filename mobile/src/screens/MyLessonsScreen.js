import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, ActivityIndicator, RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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

  const fetchLessons = async (q = '') => {
    try {
      const res = await lessonsAPI.list({ search: q });
      setLessons(res.data.lessons);
    } catch { Alert.alert('Error', 'Failed to load lessons'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchLessons(); }, []));

  const handleSearch = (text) => {
    setSearch(text);
    clearTimeout(window._st);
    window._st = setTimeout(() => fetchLessons(text), 400);
  };

  const handleDownload = async (lesson) => {
    if (user?.plan === 'free' && user?.freeExportUsed) {
      Alert.alert('Upgrade Required', 'Upgrade to PRO for unlimited downloads.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => navigation.navigate('Payment') }
      ]); return;
    }
    setDownloading(lesson._id);
    try {
      const res = await exportAPI.docx(lesson._id);
      const filename = `LessonNote_${lesson.classCode}_T${lesson.term}_W${lesson.week}.docx`;
      const path = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(path, Buffer.from(res.data).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(path, { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', dialogTitle: 'Open Lesson Note' });
    } catch (err) {
      if (err.response?.status === 402) navigation.navigate('Payment');
      else Alert.alert('Download Failed', 'Please try again.');
    } finally { setDownloading(null); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Lesson', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await lessonsAPI.delete(id);
        setLessons(l => l.filter(x => x._id !== id));
      }}
    ]);
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderItem = ({ item: l }) => (
    <TouchableOpacity style={s.item} onPress={() => navigation.navigate('LessonView', { lesson: l })}>
      <View style={s.badge}>
        <Text style={s.badgeTop}>{l.classCode}</Text>
        <Text style={s.badgeSub}>{(l.subject || '').split(' ')[0]}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.infoTitle} numberOfLines={1}>{l.subject} — {l.classCode}</Text>
        <Text style={s.infoSub}>Term {l.term}, Week {l.week} · {fmt(l.createdAt)}</Text>
      </View>
      <TouchableOpacity style={s.dlBtn} onPress={() => handleDownload(l)} disabled={downloading === l._id}>
        {downloading === l._id ? <ActivityIndicator size="small" color={colors.g2} /> : <Text style={s.dlIcon}>⬇</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(l._id)}>
        <Text style={{ fontSize: 14 }}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.searchBox}>
        <TextInput style={s.searchInput} value={search} onChangeText={handleSearch}
          placeholder="🔍  Search lessons..." placeholderTextColor={colors.ink4} />
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.g2} />
      ) : lessons.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>No lessons yet</Text>
          <Text style={s.emptySub}>Generate your first lesson from the Generate tab.</Text>
          <TouchableOpacity style={s.genBtn} onPress={() => navigation.navigate('Generate')}>
            <Text style={s.genBtnText}>✨ Generate First Lesson</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lessons} renderItem={renderItem} keyExtractor={i => i._id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLessons(search); }} tintColor={colors.g2} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBox: { backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.bg3, padding: 12, paddingHorizontal: 16 },
  searchInput: { fontSize: 14, color: colors.ink },
  item: { backgroundColor: colors.white, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.bg3, ...shadow },
  badge: { width: 46, height: 46, borderRadius: 10, backgroundColor: colors.g4, alignItems: 'center', justifyContent: 'center' },
  badgeTop: { fontSize: 12, fontWeight: '700', color: colors.g1 },
  badgeSub: { fontSize: 9, color: colors.g2 },
  info: { flex: 1 },
  infoTitle: { fontSize: 13, fontWeight: '600', color: colors.ink },
  infoSub: { fontSize: 12, color: colors.ink3, marginTop: 2 },
  dlBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: colors.bg3, alignItems: 'center', justifyContent: 'center' },
  dlIcon: { fontSize: 14 },
  delBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: colors.bg3, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.ink2, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.ink3, textAlign: 'center' },
  genBtn: { backgroundColor: colors.gd, borderRadius: 10, padding: 14, marginTop: 20 },
  genBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
