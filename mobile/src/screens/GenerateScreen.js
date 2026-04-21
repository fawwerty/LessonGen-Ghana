import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Modal, useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const { width } = useWindowDimensions();
  const [form, setForm] = useState({ classCode: '', term: '1', week: '1', style: 'Standard', extra: '' });
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [weekMode, setWeekMode] = useState('single'); // 'single' | 'range'
  const [weekFrom, setWeekFrom] = useState('1');
  const [weekTo, setWeekTo] = useState('1');

  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const insets = useSafeAreaInsets();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleSubject = (s) => {
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleGenerate = async () => {
    const { classCode, term, week } = form;
    if (!classCode || selectedSubjects.length === 0 || !term) {
      Alert.alert('Missing Fields', 'Please select Class, at least one Subject, and Term.'); return;
    }

    const startW = weekMode === 'single' ? Number(week) : Number(weekFrom);
    const endW   = weekMode === 'single' ? Number(week) : Number(weekTo);
    const totalWeeks = (endW - startW) + 1;
    const totalJobs = selectedSubjects.length * totalWeeks;

    setLoading(true); setProgress(0);
    setLoadMsg(`Starting batch of ${totalJobs} lesson(s)...`);

    try {
      let count = 0;
      let lastRes = null;

      for (const sub of selectedSubjects) {
        for (let w = startW; w <= endW; w++) {
          count++;
          setLoadMsg(`Generating ${sub} (Week ${w})...`);
          setProgress(Math.floor((count / totalJobs) * 100));

          const res = await lessonsAPI.generate({ 
            ...form, 
            subject: sub,
            term: Number(term), 
            week: w 
          });
          lastRes = res;
        }
      }

      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        if (totalJobs === 1) {
          navigation.navigate('LessonView', { lesson: lastRes.data.lessons?.[0] || lastRes.data.lesson, isJHS: lastRes.data.isJHS });
        } else {
          navigation.navigate('My Lessons');
          Alert.alert('Success', `Successfully generated ${totalJobs} lesson notes!`);
        }
      }, 400);
    } catch (err) {
      setLoading(false);
      Alert.alert('Batch Failed', err.response?.data?.message || 'Check connection.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Loading Overlay */}
      {loading && (
        <View style={s.loadOverlay}>
          <ActivityIndicator size="large" color={colors.g2} />
          <Text style={s.loadTitle}>Batch Generating...</Text>
          <Text style={s.loadSub}>{loadMsg}</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={s.progressText}>{progress}% complete</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <Text style={s.pageTitle}>Generate Notes</Text>
        <Text style={s.pageSub}>Multi-subject batch planning for NaCCA standards.</Text>

        {/* Form Card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>1. Basic Information</Text>
          
          <PickerField label="Class Level" value={form.classCode} options={CLASSES} onSelect={v => set('classCode', v)} />
          
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
             <View style={{ flex: 1 }}>
               <PickerField label="Term" value={form.term} options={TERMS} onSelect={v => set('term', v)} />
             </View>
             <View style={{ flex: 1.5 }}>
               <Text style={ps.label}>WEEK MODE</Text>
               <View style={s.modeToggle}>
                 {['single', 'range'].map(m => (
                   <TouchableOpacity key={m} onPress={() => setWeekMode(m)} style={[s.modeBtn, weekMode === m && s.modeBtnActive]}>
                     <Text style={[s.modeBtnText, weekMode === m && s.modeBtnTextActive]}>{m === 'single' ? 'One' : 'Range'}</Text>
                   </TouchableOpacity>
                 ))}
               </View>
             </View>
          </View>

          {weekMode === 'single' ? (
            <PickerField label="Select Week" value={form.week} options={WEEKS} onSelect={v => set('week', v)} />
          ) : (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <PickerField label="From" value={weekFrom} options={WEEKS} onSelect={v => setWeekFrom(v)} />
              </View>
              <View style={{ flex: 1 }}>
                <PickerField label="To" value={weekTo} options={WEEKS} onSelect={v => setWeekTo(v)} />
              </View>
            </View>
          )}

          <Text style={[s.cardTitle, { marginTop: 10 }]}>2. Select Subjects ({selectedSubjects.length})</Text>
          <View style={s.subjectGrid}>
             {SUBJECTS.map(sub => {
               const isSel = selectedSubjects.includes(sub);
               return (
                 <TouchableOpacity key={sub} onPress={() => toggleSubject(sub)} style={[s.subCard, isSel && s.subCardActive]}>
                    <View style={[s.subIcon, isSel && s.subIconActive]}>
                      <Text style={[s.subIconText, isSel && s.subIconTextActive]}>{isSel ? '✓' : sub[0]}</Text>
                    </View>
                    <Text style={[s.subName, isSel && s.subNameActive]} numberOfLines={2}>{sub}</Text>
                 </TouchableOpacity>
               );
             })}
          </View>

          <Text style={[s.cardTitle, { marginTop: 20 }]}>3. Style & Instructions</Text>
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
              style={[ps.picker, { height: 60, textAlignVertical: 'top' }]}
              value={form.extra}
              onChangeText={v => set('extra', v)}
              multiline
              placeholder="e.g. use market examples..."
              placeholderTextColor={colors.ink4}
            />
          </View>

          {/* Generate Button */}
          <TouchableOpacity 
            style={[s.genBtn, (selectedSubjects.length === 0 || !form.classCode) && { opacity: 0.5, backgroundColor: colors.bg3 }]} 
            onPress={handleGenerate} 
            disabled={loading || selectedSubjects.length === 0 || !form.classCode}
          >
            <Text style={s.genBtnText}>
              {selectedSubjects.length > 0 
                ? `Generate ${selectedSubjects.length * (weekMode === 'single' ? 1 : (Number(weekTo) - Number(weekFrom) + 1))} Lessons →`
                : 'Select subjects to start'}
            </Text>
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
  
  // New Batch Styles
  modeToggle: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: colors.bg3 },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  modeBtnActive: { backgroundColor: colors.white, ...shadow },
  modeBtnText: { fontSize: 12, fontWeight: '700', color: colors.ink3 },
  modeBtnTextActive: { color: colors.g1 },
  
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  subCard: { 
    width: '31%', backgroundColor: colors.bg, borderRadius: 16, padding: 10, 
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.bg3 
  },
  subCardActive: { borderColor: colors.g2, backgroundColor: colors.g4 },
  subIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.bg3, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  subIconActive: { backgroundColor: colors.g2 },
  subIconText: { fontSize: 14, fontWeight: '900', color: colors.ink3 },
  subIconTextActive: { color: colors.white },
  subName: { fontSize: 10, fontWeight: '700', color: colors.ink2, textAlign: 'center' },
  subNameActive: { color: colors.g1 },
});
