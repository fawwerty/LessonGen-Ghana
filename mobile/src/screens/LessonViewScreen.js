import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert
} from 'react-native';
import { colors, shadow } from '../utils/theme';
import { lessonsAPI, exportAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function LessonViewScreen({ route, navigation }) {
  const { lesson: initLesson, isJHS: initJHS } = route.params || {};
  const [lesson, setLesson] = useState(initLesson);
  const [isJHS, setIsJHS] = useState(initJHS || false);
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (lesson?._id && !initLesson?.days) {
      lessonsAPI.get(lesson._id).then(r => {
        setLesson(r.data.lesson);
        setIsJHS(['B7','B8','B9'].includes(r.data.lesson.classCode));
      });
    }
  }, []);

  const termNames = ['','ONE','TWO','THREE'];

  const handleDownload = async () => {
    if (user?.plan === 'free' && user?.freeExportUsed) {
      Alert.alert('Upgrade Required', 'Upgrade to PRO for unlimited downloads.',
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Upgrade', onPress: () => navigation.navigate('Payment') }]);
      return;
    }
    setDownloading(true);
    try {
      const res = await exportAPI.docx(lesson._id);
      const filename = `LessonNote_${lesson.classCode}_${lesson.subject.replace(/\s+/g,'_')}_T${lesson.term}_W${lesson.week}.docx`;
      const path = FileSystem.documentDirectory + filename;
      const b64 = Buffer.from(res.data).toString('base64');
      await FileSystem.writeAsStringAsync(path, b64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(path, {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dialogTitle: 'Save or Open Lesson Note',
      });
    } catch (err) {
      if (err.response?.status === 402) navigation.navigate('Payment');
      else Alert.alert('Download Failed', 'Please try again.');
    } finally { setDownloading(false); }
  };

  if (!lesson) return <ActivityIndicator style={{ flex: 1 }} color={colors.g2} />;

  const days = lesson.days || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Toolbar */}
      <View style={s.toolbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.dlBtn} onPress={handleDownload} disabled={downloading}>
          {downloading
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Text style={s.dlBtnText}>⬇ Download DOCX</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header block */}
        <View style={s.docHeader}>
          <Text style={s.docHeaderTitle}>
            TERM {termNames[lesson.term]} LESSON NOTES — WEEK {lesson.week}
          </Text>
          <Text style={s.docHeaderSub}>
            BASIC {(lesson.className || lesson.classCode).toUpperCase()} · {lesson.subject?.toUpperCase()}
          </Text>
        </View>

        {/* Meta info */}
        <View style={s.metaCard}>
          {[
            ['Week Ending', lesson.weekEnding],
            ['Class', lesson.className || lesson.classCode],
            ['Subject', lesson.subject],
            ['Reference', lesson.reference],
            ['Strand', lesson.strand],
            ['Sub-strand', lesson.subStrand],
            ['Learning Indicator(s)', lesson.indicator],
            ['Performance Indicator', lesson.performanceIndicator],
            ['Teaching/Learning Resources', lesson.teachingResources],
            ['Core Competencies', lesson.coreCompetencies],
          ].map(([k, v]) => v ? (
            <View key={k} style={s.metaRow}>
              <Text style={s.metaKey}>{k}</Text>
              <Text style={s.metaVal}>{v}</Text>
            </View>
          ) : null)}
          {isJHS && (
            <>
              {[['Duration', lesson.duration], ['Class Size', lesson.classSize], ['Content Standard', lesson.contentStandard]].map(([k, v]) => v ? (
                <View key={k} style={s.metaRow}><Text style={s.metaKey}>{k}</Text><Text style={s.metaVal}>{v}</Text></View>
              ) : null)}
            </>
          )}
        </View>

        {/* Phase sections */}
        {isJHS ? (
          /* JHS single-day format */
          <View>
            {[
              { label: 'PHASE 1: STARTER', content: days[0]?.phase1, resources: null },
              { label: 'PHASE 2: NEW LEARNING', content: days[0]?.phase2, resources: lesson.teachingResources },
              { label: 'PHASE 3: REFLECTION', content: days[0]?.phase3, resources: null },
            ].map(({ label, content, resources }) => (
              <View key={label} style={s.phaseCard}>
                <View style={s.phaseHeader}>
                  <Text style={s.phaseLabel}>{label}</Text>
                </View>
                <Text style={s.phaseContent}>{content || '—'}</Text>
                {resources && <Text style={s.phaseResources}>📦 Resources: {resources}</Text>}
              </View>
            ))}
          </View>
        ) : (
          /* Primary weekly format */
          days.map((d, i) => (
            <View key={i} style={s.dayCard}>
              <View style={s.dayHeader}>
                <Text style={s.dayLabel}>{d.day}</Text>
              </View>
              <View style={s.phaseBlock}>
                <Text style={s.phaseTitle}>PHASE 1: STARTER (10 mins)</Text>
                <Text style={s.phaseContent}>{d.phase1 || '—'}</Text>
              </View>
              <View style={[s.phaseBlock, { backgroundColor: colors.bg }]}>
                <Text style={s.phaseTitle}>PHASE 2: MAIN (40 mins)</Text>
                <Text style={s.phaseContent}>{d.phase2 || '—'}</Text>
              </View>
              <View style={s.phaseBlock}>
                <Text style={s.phaseTitle}>PHASE 3: REFLECTION (10 mins)</Text>
                <Text style={s.phaseContent}>{d.phase3 || '—'}</Text>
              </View>
            </View>
          ))
        )}

        {/* Signature block */}
        <View style={s.sigCard}>
          <Text style={s.sigTitle}>Signatures</Text>
          <View style={s.sigRow}>
            <View style={s.sigField}><Text style={s.sigLabel}>Class Teacher</Text><View style={s.sigLine} /></View>
            <View style={s.sigField}><Text style={s.sigLabel}>Head Teacher</Text><View style={s.sigLine} /></View>
          </View>
          <View style={s.sigRow}>
            <View style={s.sigField}><Text style={s.sigLabel}>Date</Text><View style={s.sigLine} /></View>
            <View style={s.sigField}><Text style={s.sigLabel}>Date</Text><View style={s.sigLine} /></View>
          </View>
        </View>

        <Text style={s.footer}>Generated by LessonGen Ghana  ✦  NaCCA-Aligned AI Lesson Planning</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  toolbar: { backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: colors.bg3, ...shadow },
  backBtn: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.bg3 },
  backText: { fontSize: 13, color: colors.ink2, fontWeight: '500' },
  dlBtn: { backgroundColor: colors.gd, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  dlBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 48 },
  docHeader: { backgroundColor: colors.g1, borderRadius: 14, padding: 20, marginBottom: 16 },
  docHeaderTitle: { fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 4 },
  docHeaderSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  metaCard: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.bg3, marginBottom: 16, overflow: 'hidden' },
  metaRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.bg3 },
  metaKey: { width: 130, padding: 10, fontSize: 12, fontWeight: '700', color: colors.g1, backgroundColor: colors.g4 },
  metaVal: { flex: 1, padding: 10, fontSize: 12, color: colors.ink2 },
  phaseCard: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.bg3, marginBottom: 12, overflow: 'hidden' },
  phaseHeader: { backgroundColor: colors.g1, padding: 10, paddingHorizontal: 14 },
  phaseLabel: { color: colors.white, fontSize: 13, fontWeight: '700' },
  phaseContent: { padding: 14, fontSize: 13, color: colors.ink2, lineHeight: 20 },
  phaseResources: { padding: 10, paddingTop: 0, fontSize: 12, color: colors.ink3, fontStyle: 'italic' },
  dayCard: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.bg3, marginBottom: 14, overflow: 'hidden' },
  dayHeader: { backgroundColor: colors.g4, padding: 10, paddingHorizontal: 14 },
  dayLabel: { color: colors.g1, fontSize: 14, fontWeight: '700' },
  phaseBlock: { padding: 12, borderTopWidth: 1, borderColor: colors.bg3 },
  phaseTitle: { fontSize: 11, fontWeight: '700', color: colors.g2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  phaseContent: { fontSize: 13, color: colors.ink2, lineHeight: 20 },
  sigCard: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.bg3, padding: 16, marginTop: 8, marginBottom: 16 },
  sigTitle: { fontSize: 13, fontWeight: '700', color: colors.g1, marginBottom: 12 },
  sigRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  sigField: { flex: 1 },
  sigLabel: { fontSize: 11, color: colors.ink3, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  sigLine: { height: 1, backgroundColor: colors.bg3, marginTop: 24 },
  footer: { textAlign: 'center', fontSize: 11, color: colors.ink4, marginTop: 8 },
});
