import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Modal
} from 'react-native';
import { colors, shadow } from '../utils/theme';
import { lessonsAPI } from '../services/api';

const CLASSES = ['KG1','KG2','B1','B2','B3','B4','B5','B6','B7','B8','B9'];
const SUBJECTS = [
  'English Language','Mathematics','Science',
  'Our World Our People (OWOP)','Social Studies',
  'Religious and Moral Education (RME)','Creative Arts and Design',
  'Ghanaian Language','Physical Education','Computing (ICT)',
  'Career Technology','French Language','History',
];
const STYLES = ['Standard','Activity-based','Assessment-focused','Play-based','Project-based'];

function Picker({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={ps.field}>
      <Text style={ps.label}>{label}</Text>
      <TouchableOpacity style={ps.picker} onPress={() => setOpen(true)}>
        <Text style={[ps.pickerText, !value && { color: colors.ink4 }]}>{value || `Select ${label}...`}</Text>
        <Text style={{ color: colors.ink3 }}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={ps.backdrop} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={ps.sheet}>
            <Text style={ps.sheetTitle}>{label}</Text>
            <ScrollView>
              {options.map(o => (
                <TouchableOpacity key={o} style={[ps.option, value === o && ps.optionActive]} onPress={() => { onSelect(o); setOpen(false); }}>
                  <Text style={[ps.optionText, value === o && { color: colors.g1, fontWeight: '700' }]}>{o}</Text>
                  {value === o && <Text style={{ color: colors.g2 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const ps = StyleSheet.create({
  field: { marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '700', color: colors.ink3, letterSpacing: 0.6, marginBottom: 5, textTransform: 'uppercase' },
  picker: { backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.bg3, borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerText: { fontSize: 14, color: colors.ink },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.g1, marginBottom: 12, textAlign: 'center' },
  option: { padding: 14, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionActive: { backgroundColor: colors.g4 },
  optionText: { fontSize: 14, color: colors.ink2 },
});

const LOAD_MSGS = [
  'Retrieving NaCCA curriculum data...',
  'Mapping strand and indicators...',
  'Designing teaching activities...',
  'Building lesson phases...',
  'Validating against NaCCA standards...',
  'Formatting your lesson note...',
];

export default function GenerateScreen({ navigation }) {
  const [form, setForm] = useState({ classCode:'', subject:'', term:'', week:'', style:'Standard', extra:'' });
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleGenerate = async () => {
    const { classCode, subject, term, week } = form;
    if (!classCode || !subject || !term || !week) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.'); return;
    }
    setLoading(true); setProgress(5);
    let idx = 0; setLoadMsg(LOAD_MSGS[0]);
    const iv = setInterval(() => {
      idx = (idx + 1) % LOAD_MSGS.length;
      setLoadMsg(LOAD_MSGS[idx]);
      setProgress(p => Math.min(p + 14, 88));
    }, 2000);

    try {
      const res = await lessonsAPI.generate({ ...form, term: Number(form.term), week: Number(form.week) });
      clearInterval(iv); setProgress(100);
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('LessonView', { lesson: res.data.lesson, isJHS: res.data.isJHS });
      }, 400);
    } catch (err) {
      clearInterval(iv); setLoading(false);
      Alert.alert('Generation Failed', err.response?.data?.message || 'Please check your connection and try again.');
    }
  };

  const terms = ['1','2','3'];
  const weeks = Array.from({ length: 13 }, (_, i) => String(i + 1));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {loading && (
        <View style={s.loadOverlay}>
          <ActivityIndicator size="large" color={colors.g2} />
          <Text style={s.loadTitle}>Generating lesson...</Text>
          <Text style={s.loadSub}>{loadMsg}</Text>
          <View style={s.progressBar}><View style={[s.progressFill, { width: `${progress}%` }]} /></View>
        </View>
      )}
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.pageTitle}>Generate Lesson Note</Text>
        <Text style={s.pageSub}>Select parameters for your NaCCA-aligned lesson.</Text>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[['12','Subjects'],['KG–JHS3','Levels'],['NaCCA','Standard']].map(([n,l]) => (
            <View key={l} style={s.statCard}><Text style={s.statNum}>{n}</Text><Text style={s.statLbl}>{l}</Text></View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>📋 Lesson Parameters</Text>
          <Picker label="Class Level" value={form.classCode} options={CLASSES} onSelect={v => set('classCode', v)} />
          <Picker label="Subject" value={form.subject} options={SUBJECTS} onSelect={v => set('subject', v)} />
          <Picker label="Term" value={form.term} options={terms} onSelect={v => set('term', v)} />
          <Picker label="Week" value={form.week} options={weeks} onSelect={v => set('week', v)} />

          <View style={ps.field}>
            <Text style={ps.label}>Lesson Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
              {STYLES.map(st => (
                <TouchableOpacity key={st} onPress={() => set('style', st)}
                  style={[s.pill, form.style === st && s.pillActive]}>
                  <Text style={[s.pillText, form.style === st && s.pillTextActive]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={ps.field}>
            <Text style={ps.label}>Special Instructions (Optional)</Text>
            <TextInput style={[ps.picker, { height: 70, textAlignVertical: 'top' }]} value={form.extra}
              onChangeText={v => set('extra', v)} multiline
              placeholder="e.g. Include Twi vocabulary, use market examples..."
              placeholderTextColor={colors.ink4} />
          </View>

          <TouchableOpacity style={s.genBtn} onPress={handleGenerate} disabled={loading}>
            <Text style={s.genBtnText}>✨  Generate Lesson Note</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: colors.g1, marginBottom: 4 },
  pageSub: { fontSize: 13, color: colors.ink3, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.bg3, ...shadow },
  statNum: { fontSize: 20, fontWeight: '700', color: colors.g1 },
  statLbl: { fontSize: 10, color: colors.ink3, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.bg3, ...shadow },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.ink2, marginBottom: 16 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.bg3, backgroundColor: colors.bg, marginRight: 8 },
  pillActive: { borderColor: colors.g2, backgroundColor: colors.g4 },
  pillText: { fontSize: 12, color: colors.ink2, fontWeight: '500' },
  pillTextActive: { color: colors.g1, fontWeight: '700' },
  genBtn: { backgroundColor: colors.gd, borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8, ...shadow },
  genBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  loadOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(248,246,240,0.97)', zIndex: 100, alignItems: 'center', justifyContent: 'center', top: 0, left: 0, right: 0, bottom: 0 },
  loadTitle: { fontSize: 18, fontWeight: '700', color: colors.g1, marginTop: 16 },
  loadSub: { fontSize: 13, color: colors.ink3, marginTop: 8 },
  progressBar: { width: 240, height: 4, backgroundColor: colors.bg3, borderRadius: 2, overflow: 'hidden', marginTop: 20 },
  progressFill: { height: '100%', backgroundColor: colors.g2, borderRadius: 2 },
});
