import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Modal, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../utils/theme';
import { lessonsAPI } from '../services/api';

const { width } = Dimensions.get('window');

const CLASSES = ['KG1','KG2','B1','B2','B3','B4','B5','B6','B7','B8','B9'];
const SUBJECTS = [
  'English Language','Mathematics','Science',
  'Our World Our People (OWOP)','Social Studies',
  'Religious and Moral Education (RME)','Creative Arts and Design',
  'Ghanaian Language','Physical Education','Computing (ICT)',
  'Career Technology','French Language','History',
];
const STYLES = ['Standard','Activity-based','Assessment-focused','Play-based','Project-based'];
const TERMS = ['1','2','3'];
const WEEKS = Array.from({ length: 13 }, (_, i) => String(i + 1));

const LOAD_MSGS = [
  'Retrieving NaCCA curriculum data...',
  'Mapping strand and indicators...',
  'Designing teaching activities...',
  'Building lesson phases...',
  'Validating against NaCCA standards...',
  'Formatting your lesson note...',
];

function PickerField({ label, value, options, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={ps.field}>
      <Text style={ps.label}>{label.toUpperCase()}</Text>
      <TouchableOpacity style={[ps.picker, value && ps.pickerFilled]} onPress={() => setOpen(true)}>
        <Text style={[ps.pickerText, !value && { color: colors.ink4 }]}>{value || `Select ${label}...`}</Text>
        <Text style={{ color: colors.ink3, fontSize: 12 }}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={ps.backdrop} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={ps.sheet}>
            <View style={ps.sheetHandle} />
            <Text style={ps.sheetTitle}>{label}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map(o => (
                <TouchableOpacity
                  key={o}
                  style={[ps.option, value === o && ps.optionActive]}
                  onPress={() => { onSelect(o); setOpen(false); }}
                >
                  <Text style={[ps.optionText, value === o && ps.optionTextActive]}>{o}</Text>
                  {value === o && <Text style={{ color: colors.g2, fontWeight: '800' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function GenerateScreen({ navigation }) {
  const [form, setForm] = useState({ classCode: '', subject: '', term: '', week: '', style: 'Standard', extra: '' });
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const insets = useSafeAreaInsets();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleGenerate = async () => {
    const { classCode, subject, term, week } = form;
    if (!classCode || !subject || !term || !week) {
      Alert.alert('Missing Fields', 'Please fill in Class, Subject, Term, and Week.'); return;
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
        navigation.navigate('LessonView', { lesson: res.data.lessons?.[0] || res.data.lesson, isJHS: res.data.isJHS });
      }, 400);
    } catch (err) {
      clearInterval(iv); setLoading(false);
      Alert.alert('Generation Failed', err.response?.data?.message || 'Please check your connection and try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Loading Overlay */}
      {loading && (
        <View style={s.loadOverlay}>
          <ActivityIndicator size="large" color={colors.g2} />
          <Text style={s.loadTitle}>Generating lesson...</Text>
          <Text style={s.loadSub}>{loadMsg}</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={s.progressText}>{progress}%</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <Text style={s.pageTitle}>Generate Lesson Note</Text>
        <Text style={s.pageSub}>Select parameters for your NaCCA-aligned lesson.</Text>

        {/* Stats Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statsScroll} contentContainerStyle={s.statsRow}>
          {[['12', 'Subjects'], ['KG-JHS3', 'Levels'], ['NaCCA', 'Standard'], ['3', 'Terms']].map(([n, l]) => (
            <View key={l} style={s.statCard}>
              <Text style={s.statNum}>{n}</Text>
              <Text style={s.statLbl}>{l}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Form Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Lesson Parameters</Text>

          <PickerField label="Class Level" value={form.classCode} options={CLASSES} onSelect={v => set('classCode', v)} />
          <PickerField label="Subject" value={form.subject} options={SUBJECTS} onSelect={v => set('subject', v)} />
          <PickerField label="Term" value={form.term} options={TERMS} onSelect={v => set('term', v)} />
          <PickerField label="Week" value={form.week} options={WEEKS} onSelect={v => set('week', v)} />

          {/* Style Pills */}
          <View style={ps.field}>
            <Text style={ps.label}>LESSON STYLE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
              {STYLES.map(st => (
                <TouchableOpacity key={st} onPress={() => set('style', st)} style={[s.pill, form.style === st && s.pillActive]}>
                  <Text style={[s.pillText, form.style === st && s.pillTextActive]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Extra */}
          <View style={ps.field}>
            <Text style={ps.label}>SPECIAL INSTRUCTIONS (OPTIONAL)</Text>
            <TextInput
              style={[ps.picker, { height: 80, textAlignVertical: 'top' }]}
              value={form.extra}
              onChangeText={v => set('extra', v)}
              multiline
              placeholder="e.g. Include Twi vocabulary, use market examples..."
              placeholderTextColor={colors.ink4}
            />
          </View>

          {/* Generate Button */}
          <TouchableOpacity style={s.genBtn} onPress={handleGenerate} disabled={loading}>
            <Text style={s.genBtnText}>Generate Lesson Note  →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const ps = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '800', color: colors.ink3, letterSpacing: 0.8, marginBottom: 6 },
  picker: {
    backgroundColor: colors.bg, borderWidth: 1.5, borderColor: colors.bg3,
    borderRadius: 12, padding: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  pickerFilled: { borderColor: colors.g2, backgroundColor: colors.g4 },
  pickerText: { fontSize: 14, color: colors.ink, flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.bg3, alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: colors.g1, marginBottom: 14, textAlign: 'center' },
  option: { padding: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionActive: { backgroundColor: colors.g4 },
  optionText: { fontSize: 14, color: colors.ink2 },
  optionTextActive: { color: colors.g1, fontWeight: '700' },
});

const s = StyleSheet.create({
  scroll: { padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: colors.g1, marginBottom: 4 },
  pageSub: { fontSize: 13, color: colors.ink3, marginBottom: 20, fontWeight: '500' },
  statsScroll: { marginBottom: 20, marginHorizontal: -20 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  statCard: {
    backgroundColor: colors.white, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.bg3, alignItems: 'center', minWidth: 80,
    ...shadow,
  },
  statNum: { fontSize: 18, fontWeight: '800', color: colors.g1 },
  statLbl: { fontSize: 10, color: colors.ink4, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  card: {
    backgroundColor: colors.white, borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: colors.bg3, ...shadow,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.ink2, marginBottom: 18 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: colors.bg3, backgroundColor: colors.bg,
  },
  pillActive: { borderColor: colors.g2, backgroundColor: colors.g4 },
  pillText: { fontSize: 12, color: colors.ink2, fontWeight: '600' },
  pillTextActive: { color: colors.g1, fontWeight: '800' },
  genBtn: {
    backgroundColor: colors.gd, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8,
    shadowColor: colors.gd, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  genBtnText: { color: colors.g1, fontSize: 16, fontWeight: '800' },
  loadOverlay: {
    ...StyleSheet.absoluteFillObject, zIndex: 100,
    backgroundColor: 'rgba(248,246,240,0.97)',
    alignItems: 'center', justifyContent: 'center',
  },
  loadTitle: { fontSize: 18, fontWeight: '800', color: colors.g1, marginTop: 20 },
  loadSub: { fontSize: 13, color: colors.ink3, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
  progressBar: { width: 220, height: 5, backgroundColor: colors.bg3, borderRadius: 3, overflow: 'hidden', marginTop: 24 },
  progressFill: { height: '100%', backgroundColor: colors.g2, borderRadius: 3 },
  progressText: { fontSize: 12, color: colors.ink3, marginTop: 8, fontWeight: '600' },
});
