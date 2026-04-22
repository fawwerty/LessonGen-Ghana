import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Modal, useWindowDimensions,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../utils/theme';
import { lessonsAPI, schemeAPI, timetableAPI } from '../services/api';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';

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

function PickerField({ label, value, options, onSelect, multi = false }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={ps.field}>
      <Text style={ps.label}>{label.toUpperCase()}</Text>
      <TouchableOpacity style={[ps.picker, value && (Array.isArray(value) ? value.length > 0 : true) && ps.pickerFilled]} onPress={() => setOpen(true)}>
        <Text style={[ps.pickerText, (!value || (Array.isArray(value) && value.length === 0)) && { color: colors.ink4 }]} numberOfLines={1}>
          {Array.isArray(value) 
            ? (value.length > 0 ? value.join(', ') : `Select ${label}...`)
            : (value || `Select ${label}...`)}
        </Text>
        <Text style={{ color: colors.ink3, fontSize: 12 }}>▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={ps.backdrop} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={ps.sheet}>
            <View style={ps.sheetHandle} />
            <Text style={ps.sheetTitle}>{label}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map(o => {
                const isSel = multi ? value?.includes(o) : value === o;
                return (
                  <TouchableOpacity
                    key={o}
                    style={[ps.option, isSel && ps.optionActive]}
                    onPress={() => { 
                      if (multi) {
                        const next = value.includes(o) ? value.filter(x => x !== o) : [...value, o];
                        onSelect(next);
                      } else {
                        onSelect(o); 
                        setOpen(false); 
                      }
                    }}
                  >
                    <Text style={[ps.optionText, isSel && ps.optionTextActive]}>{o}</Text>
                    {isSel && <Text style={{ color: colors.g2, fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {multi && (
               <TouchableOpacity style={[s.genBtn, { marginTop: 10 }]} onPress={() => setOpen(false)}>
                 <Text style={s.genBtnText}>Done</Text>
               </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function GenerateScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const [mode, setMode] = useState('standard'); // 'standard' | 'timetable' | 'scheme'
  const [form, setForm] = useState({ classCode: '', term: '1', week: '1', style: 'Standard', extra: '' });
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [weekMode, setWeekMode] = useState('single');
  const [weekFrom, setWeekFrom] = useState('1');
  const [weekTo, setWeekTo] = useState('1');

  // Timetable state
  const [timetable, setTimetable] = useState(null);
  const [uploadingTT, setUploadingTT] = useState(false);

  // Scheme state
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState('');
  const [progress, setProgress] = useState(0);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const loadData = useCallback(async () => {
    try {
      const sRes = await schemeAPI.list();
      setSchemes(sRes.data.schemes || []);
      
      if (form.classCode) {
        const tRes = await timetableAPI.get(form.classCode);
        setTimetable(tRes.data.timetable);
      }
    } catch {}
  }, [form.classCode]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const pickTimetable = async () => {
    if (!form.classCode) { Alert.alert('Select Class', 'Please select a class first.'); return; }
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'] });
      if (!res.canceled && res.assets?.length) {
        setUploadingTT(true);
        const fd = new FormData();
        fd.append('timetable', { uri: res.assets[0].uri, name: res.assets[0].name, type: res.assets[0].mimeType });
        fd.append('classCode', form.classCode);
        await timetableAPI.upload(fd);
        Alert.alert('Success', 'Timetable uploaded and parsed!');
        loadData();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to upload timetable.');
    } finally {
      setUploadingTT(false);
    }
  };

  const toggleSubject = (s) => {
    setSelectedSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleGenerate = async () => {
    const { classCode, term, week } = form;
    if (!classCode || (mode !== 'scheme' && selectedSubjects.length === 0) || !term) {
      Alert.alert('Missing Fields', 'Please complete the form requirements.'); return;
    }

    if (mode === 'scheme' && !selectedScheme) {
      Alert.alert('Select Scheme', 'Please select a saved scheme to generate from.'); return;
    }

    setLoading(true); setProgress(0);
    
    try {
      if (mode === 'scheme') {
        const startW = weekMode === 'single' ? Number(week) : Number(weekFrom);
        const endW   = weekMode === 'single' ? Number(week) : Number(weekTo);
        setLoadMsg(`Generating from scheme: ${selectedScheme.subject}...`);
        
        await schemeAPI.generateRange({
          schemeId: selectedScheme._id,
          weekFrom: startW,
          weekTo: endW,
          classCode: selectedScheme.classCode,
          subject: selectedScheme.subject,
          term: Number(term),
          teachingDays: '5'
        });
      } else {
        const startW = weekMode === 'single' ? Number(week) : Number(weekFrom);
        const endW   = weekMode === 'single' ? Number(week) : Number(weekTo);
        const totalJobs = selectedSubjects.length * (endW - startW + 1);
        let count = 0;

        for (const sub of selectedSubjects) {
          for (let w = startW; w <= endW; w++) {
            count++;
            setLoadMsg(`Generating ${sub} (Week ${w})...`);
            setProgress(Math.floor((count / totalJobs) * 100));
            await lessonsAPI.generate({ ...form, subject: sub, term: Number(term), week: w });
          }
        }
      }

      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('My Lessons');
        Alert.alert('Success', 'Lesson notes generated successfully!');
      }, 400);
    } catch (err) {
      setLoading(false);
      Alert.alert('Failed', err.response?.data?.message || 'Check connection.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Loading Overlay */}
      {loading && (
        <View style={s.loadOverlay}>
          <ActivityIndicator size="large" color={colors.g2} />
          <Text style={s.loadTitle}>{mode === 'scheme' ? 'Parsing Scheme...' : 'Batch Generating...'}</Text>
          <Text style={s.loadSub}>{loadMsg}</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={s.progressText}>{progress}% complete</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>AI Lesson Planner</Text>
        <Text style={s.pageSub}>Choose your planning source for smarter generation.</Text>

        {/* Source Selector */}
        <View style={s.sourceRow}>
          {[
            { id: 'standard', label: 'Manual', icon: '📝' },
            { id: 'timetable', label: 'Timetable', icon: '📅' },
            { id: 'scheme', label: 'Scheme', icon: '📜' }
          ].map(src => (
            <TouchableOpacity key={src.id} onPress={() => setMode(src.id)} style={[s.sourceBtn, mode === src.id && s.sourceBtnActive]}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>{src.icon}</Text>
              <Text style={[s.sourceBtnText, mode === src.id && s.sourceBtnTextActive]}>{src.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.card}>
          {/* 1. SOURCE SPECIFIC CONTENT */}
          {mode === 'timetable' && (
            <View style={s.sourceSection}>
              <Text style={s.cardTitle}>1. Class Timetable</Text>
              {!form.classCode ? (
                <Text style={{ fontSize: 12, color: colors.ink4, textAlign: 'center', marginVertical: 10 }}>Select Class Level below to load timetable.</Text>
              ) : timetable ? (
                <View style={s.ttPreview}>
                   <Text style={{ fontSize: 13, fontWeight: '700', color: colors.g1 }}>✅ Timetable Loaded for {form.classCode}</Text>
                   <TouchableOpacity onPress={pickTimetable}><Text style={{ fontSize: 12, color: colors.g2, marginTop: 4 }}>Update Timetable</Text></TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={s.uploadBtn} onPress={pickTimetable} disabled={uploadingTT}>
                  {uploadingTT ? <ActivityIndicator color={colors.g2} /> : (
                    <>
                      <Text style={{ fontSize: 24 }}>📄</Text>
                      <Text style={s.uploadBtnText}>Upload Timetable</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {mode === 'scheme' && (
            <View style={s.sourceSection}>
              <Text style={s.cardTitle}>1. Select Saved Scheme</Text>
              {schemes.length === 0 ? (
                <TouchableOpacity onPress={() => navigation.navigate('Scheme')} style={s.uploadBtn}>
                  <Text style={{ fontSize: 12, color: colors.ink3, textAlign: 'center' }}>No saved schemes found. Go to "Scheme" tab to parse one.</Text>
                </TouchableOpacity>
              ) : (
                <PickerField 
                  label="Saved Scheme" 
                  value={selectedScheme ? `${selectedScheme.subject} (${selectedScheme.classCode})` : ''} 
                  options={schemes.map(sch => `${sch.subject} (${sch.classCode})`)} 
                  onSelect={(v) => {
                    const found = schemes.find(sch => `${sch.subject} (${sch.classCode})` === v);
                    setSelectedScheme(found);
                    set('classCode', found.classCode);
                    set('term', String(found.term));
                  }} 
                />
              )}
            </View>
          )}

          {/* 2. SHARED FORM */}
          <Text style={s.cardTitle}>{mode === 'standard' ? '1. Basic Info' : '2. Period Details'}</Text>
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

          {mode !== 'scheme' && (
            <>
              <Text style={[s.cardTitle, { marginTop: 10 }]}>3. Select Subjects ({selectedSubjects.length})</Text>
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
            </>
          )}

          <Text style={[s.cardTitle, { marginTop: 20 }]}>{mode === 'scheme' ? '3. Style' : '4. Style'}</Text>
          <PickerField label="Lesson Style" value={form.style} options={STYLES} onSelect={v => set('style', v)} />

          <TouchableOpacity 
            style={[s.genBtn, (selectedSubjects.length === 0 && mode !== 'scheme' || !form.classCode) && { opacity: 0.5, backgroundColor: colors.bg3 }]} 
            onPress={handleGenerate} 
            disabled={loading || (selectedSubjects.length === 0 && mode !== 'scheme') || !form.classCode}
          >
            <Text style={s.genBtnText}>
              {mode === 'scheme' ? 'Generate Aligned Lessons →' : `Generate ${selectedSubjects.length * (weekMode === 'single' ? 1 : (Number(weekTo) - Number(weekFrom) + 1))} Lessons →`}
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
  sourceRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  sourceBtn: { flex: 1, backgroundColor: colors.white, padding: 12, borderRadius: 16, borderWith: 1, borderColor: colors.bg3, alignItems: 'center', ...shadow },
  sourceBtnActive: { borderColor: colors.g2, backgroundColor: colors.g4 },
  sourceBtnText: { fontSize: 11, fontWeight: '800', color: colors.ink4, textTransform: 'uppercase' },
  sourceBtnTextActive: { color: colors.g1 },
  sourceSection: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.bg },
  uploadBtn: { height: 100, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.bg3, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.bg },
  uploadBtnText: { fontSize: 13, fontWeight: '700', color: colors.ink2 },
  ttPreview: { padding: 14, backgroundColor: colors.g4, borderRadius: 12, borderWidth: 1, borderColor: colors.g2 },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: colors.bg3, ...shadow },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.ink2, marginBottom: 14 },
  modeToggle: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 12, padding: 4, borderWidth: 1.5, borderColor: colors.bg3 },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  modeBtnActive: { backgroundColor: colors.white, ...shadow },
  modeBtnText: { fontSize: 12, fontWeight: '700', color: colors.ink3 },
  modeBtnTextActive: { color: colors.g1 },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  subCard: { width: '31%', backgroundColor: colors.bg, borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: colors.bg3 },
  subCardActive: { borderColor: colors.g2, backgroundColor: colors.g4 },
  subIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.bg3, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  subIconActive: { backgroundColor: colors.g2 },
  subIconText: { fontSize: 14, fontWeight: '900', color: colors.ink3 },
  subIconTextActive: { color: colors.white },
  subName: { fontSize: 9, fontWeight: '700', color: colors.ink2, textAlign: 'center' },
  subNameActive: { color: colors.g1 },
  genBtn: { backgroundColor: colors.gd, borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 16, shadowColor: colors.gd, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6 },
  genBtnText: { color: colors.g1, fontSize: 16, fontWeight: '900' },
  loadOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, backgroundColor: 'rgba(248,246,240,0.98)', alignItems: 'center', justifyContent: 'center' },
  loadTitle: { fontSize: 20, fontWeight: '900', color: colors.g1, marginTop: 24 },
  loadSub: { fontSize: 13, color: colors.ink3, marginTop: 10, textAlign: 'center', paddingHorizontal: 40 },
  progressBar: { width: 240, height: 6, backgroundColor: colors.bg3, borderRadius: 3, overflow: 'hidden', marginTop: 24 },
  progressFill: { height: '100%', backgroundColor: colors.g2 },
  progressText: { fontSize: 12, color: colors.ink3, marginTop: 10, fontWeight: '700' },
});
