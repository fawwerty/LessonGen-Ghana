import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, FlatList, Modal,
  useWindowDimensions
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { schemeAPI } from '../services/api';

const C = {
  g1: '#0D3B22', g2: '#1A6B3C', g4: '#D4EDE0', gd: '#C8971A',
  white: '#FFFFFF', ink: '#1A1814', ink2: '#3D3A30', ink3: '#6B6759', ink4: '#9A9890',
  bg: '#F8F6F0', bg3: '#E2DED4', red: '#B83232', violet: '#7C3AED', violetL: '#EDE9FE',
};
const shadow = { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 };

const CLASSES = ['KG1','KG2','B1','B2','B3','B4','B5','B6','B7','B8','B9'];
const SUBJECTS = ['English Language','Mathematics','Science','Our World Our People (OWOP)','Social Studies','Religious and Moral Education (RME)','Creative Arts and Design','Ghanaian Language','Physical Education','Computing (ICT)','Career Technology','French Language','History'];

// ── Small Picker Modal ────────────────────────────────────────────────────────
function PickerModal({ visible, title, options, value, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={ps.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={ps.sheet}>
          <View style={ps.handle} />
          <Text style={ps.sheetTitle}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map(o => (
              <TouchableOpacity key={o} style={[ps.option, value === o && ps.optionActive]} onPress={() => { onSelect(o); onClose(); }}>
                <Text style={[ps.optionText, value === o && ps.optionTextActive]}>{o}</Text>
                {value === o && <Text style={{ color: C.g2, fontWeight: '800' }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const ps = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.bg3, alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: C.g1, marginBottom: 14, textAlign: 'center' },
  option: { padding: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionActive: { backgroundColor: C.g4 },
  optionText: { fontSize: 14, color: C.ink2 },
  optionTextActive: { color: C.g1, fontWeight: '700' },
});

// ── Week Card ─────────────────────────────────────────────────────────────────
function WeekChip({ week, selected, onToggle }) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(week.week)}
      style={[
        s.weekChip,
        selected && s.weekChipActive,
      ]}
    >
      <Text style={[s.weekChipNum, selected && s.weekChipNumActive]}>{week.week}</Text>
      {week.strand ? <Text style={[s.weekChipStrand, selected && { color: C.g1 }]} numberOfLines={1}>{week.strand}</Text> : null}
    </TouchableOpacity>
  );
}

// ── Main SchemeScreen ─────────────────────────────────────────────────────────
export default function SchemeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // Step 1: Setup
  const [tab, setTab]             = useState('paste'); // 'file' | 'paste'
  const [classCode, setClassCode] = useState('');
  const [subject, setSubject]     = useState('');
  const [term, setTerm]           = useState('1');
  const [pickerOpen, setPickerOpen] = useState(null); // 'class' | 'subject'
  const [pasteText, setPasteText] = useState('');
  const [pickedFile, setPickedFile] = useState(null);

  // Step 2: Parsing
  const [parsing, setParsing]     = useState(false);

  // Step 3: Review
  const [activeScheme, setActiveScheme] = useState(null);
  const [savedSchemes, setSavedSchemes] = useState([]);

  // Step 4: Generate
  const [genMode, setGenMode]     = useState('range'); // 'single' | 'range' | 'full'
  const [weekFrom, setWeekFrom]   = useState(1);
  const [weekTo, setWeekTo]       = useState(1);
  const [singleWeek, setSingleWeek] = useState(1);
  const [teachingDays, setTeachingDays] = useState('5');
  const [generating, setGenerating] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  const loadSchemes = useCallback(async () => {
    try {
      const res = await schemeAPI.list();
      setSavedSchemes(res.data.schemes || []);
    } catch {}
  }, []);

  useFocusEffect(useCallback(() => { loadSchemes(); }, [loadSchemes]));

  useEffect(() => {
    if (activeScheme?.weeklyBreakdown?.length) {
      setWeekFrom(activeScheme.weeklyBreakdown[0].week);
      setWeekTo(activeScheme.weeklyBreakdown[activeScheme.weeklyBreakdown.length - 1].week);
    }
  }, [activeScheme]);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'], copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.length) setPickedFile(res.assets[0]);
    } catch { Alert.alert('Error', 'Failed to pick file.'); }
  };

  const handleParse = async () => {
    if (!classCode || !subject || !term) { Alert.alert('Missing Info', 'Select class, subject, and term first.'); return; }
    if (tab === 'paste' && !pasteText.trim()) { Alert.alert('Missing Text', 'Paste your scheme text below.'); return; }
    if (tab === 'file' && !pickedFile) { Alert.alert('No File', 'Pick a file first.'); return; }

    setParsing(true);
    setCurrentStep(2);
    try {
      let res;
      if (tab === 'paste') {
        res = await schemeAPI.paste({ classCode, subject, term: Number(term), rawText: pasteText });
      } else {
        const fd = new FormData();
        fd.append('schemeFile', { uri: pickedFile.uri, name: pickedFile.name, type: pickedFile.mimeType });
        fd.append('classCode', classCode);
        fd.append('subject', subject);
        fd.append('term', term);
        res = await schemeAPI.upload(fd);
      }
      setActiveScheme(res.data.scheme);
      loadSchemes();
      setCurrentStep(3);
    } catch (err) {
      Alert.alert('Parse Failed', err.response?.data?.message || 'Could not parse scheme. Check your text and try again.');
      setCurrentStep(1);
    } finally {
      setParsing(false);
    }
  };

  const handleGenerate = async () => {
    const wb = activeScheme?.weeklyBreakdown || [];
    let weeks;
    if (genMode === 'full') weeks = wb;
    else if (genMode === 'single') weeks = wb.filter(w => w.week === singleWeek);
    else weeks = wb.filter(w => w.week >= weekFrom && w.week <= weekTo);

    if (!weeks.length) { Alert.alert('No Weeks', 'No weeks match your selection.'); return; }

    setGenerating(true);
    setCurrentStep(4);
    try {
      const res = await schemeAPI.generateRange({
        schemeId: activeScheme._id,
        weekFrom: Math.min(...weeks.map(w => w.week)),
        weekTo:   Math.max(...weeks.map(w => w.week)),
        classCode: activeScheme.classCode,
        subject:   activeScheme.subject,
        term:      activeScheme.term,
        teachingDays,
      });
      Alert.alert('Done!', `${res.data.count} lesson note${res.data.count > 1 ? 's' : ''} generated successfully!`, [
        { text: 'View Lessons', onPress: () => navigation.navigate('My Lessons') },
        { text: 'OK' },
      ]);
      setCurrentStep(3);
    } catch (err) {
      Alert.alert('Generation Failed', err.response?.data?.message || 'Please try again.');
      setCurrentStep(3);
    } finally {
      setGenerating(false);
    }
  };

  const wb = activeScheme?.weeklyBreakdown || [];

  return (
    <View style={[s.container, { paddingBottom: insets.bottom }]}>
      {/* Picker Modals */}
      <PickerModal visible={pickerOpen === 'class'} title="Class Level" options={CLASSES} value={classCode} onSelect={setClassCode} onClose={() => setPickerOpen(null)} />
      <PickerModal visible={pickerOpen === 'subject'} title="Subject" options={SUBJECTS} value={subject} onSelect={setSubject} onClose={() => setPickerOpen(null)} />

      {/* Step Indicator */}
      <View style={s.stepBar}>
        {['Setup','Parse','Review','Generate'].map((lbl, i) => (
          <View key={lbl} style={s.stepItem}>
            <View style={[s.stepDot, currentStep > i + 1 && s.stepDotDone, currentStep === i + 1 && s.stepDotActive]}>
              {currentStep > i + 1 ? <Text style={s.stepCheck}>✓</Text> : <Text style={[s.stepNum, currentStep === i + 1 && { color: C.white }]}>{i + 1}</Text>}
            </View>
            <Text style={[s.stepLbl, currentStep === i + 1 && s.stepLblActive]}>{lbl}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: 40 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── STEP 1: Setup ─────────────────────────────────── */}
        {currentStep === 1 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Upload Scheme of Work</Text>
            <Text style={s.cardSub}>Select your class, subject, and term, then paste or upload your TSoW.</Text>

            {/* Class & Subject */}
            <View style={s.row2}>
              <TouchableOpacity style={[s.picker, classCode && s.pickerFilled]} onPress={() => setPickerOpen('class')}>
                <Text style={s.label}>CLASS</Text>
                <Text style={[s.pickerVal, !classCode && { color: C.ink4 }]}>{classCode || 'Select...'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.picker, subject && s.pickerFilled]} onPress={() => setPickerOpen('subject')}>
                <Text style={s.label}>SUBJECT</Text>
                <Text style={[s.pickerVal, !subject && { color: C.ink4 }]} numberOfLines={1}>{subject || 'Select...'}</Text>
              </TouchableOpacity>
            </View>

            {/* Term */}
            <View style={s.termRow}>
              {['1','2','3'].map(t => (
                <TouchableOpacity key={t} onPress={() => setTerm(t)} style={[s.termPill, term === t && s.termPillActive]}>
                  <Text style={[s.termPillText, term === t && s.termPillTextActive]}>Term {t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab switch */}
            <View style={s.tabRow}>
              {[['paste','Paste Text'], ['file','Pick File']].map(([k, l]) => (
                <TouchableOpacity key={k} onPress={() => setTab(k)} style={[s.tabBtn, tab === k && s.tabBtnActive]}>
                  <Text style={[s.tabBtnText, tab === k && s.tabBtnTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {tab === 'paste' ? (
              <TextInput
                style={s.textArea}
                value={pasteText}
                onChangeText={setPasteText}
                multiline
                numberOfLines={8}
                placeholder="Paste your Termly Scheme of Work here...&#10;&#10;Include week numbers, strands, sub-strands, and learning indicators."
                placeholderTextColor={C.ink4}
                textAlignVertical="top"
              />
            ) : (
              <TouchableOpacity style={s.fileZone} onPress={pickFile}>
                {pickedFile ? (
                  <View style={{ alignItems: 'center', gap: 8 }}>
                    <Text style={s.fileIcon}>📄</Text>
                    <Text style={s.fileName}>{pickedFile.name}</Text>
                    <Text style={s.fileSub}>{((pickedFile.size || 0) / 1024).toFixed(1)} KB</Text>
                    <TouchableOpacity onPress={() => setPickedFile(null)}><Text style={{ color: C.red, fontSize: 13 }}>Remove</Text></TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', gap: 10 }}>
                    <Text style={s.fileIcon}>↑</Text>
                    <Text style={s.fileZoneTitle}>Tap to pick a file</Text>
                    <Text style={s.fileZoneSub}>PDF · DOCX · TXT</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={s.primaryBtn} onPress={handleParse}>
              <Text style={s.primaryBtnText}>Parse with AI →</Text>
            </TouchableOpacity>

            {/* Saved Schemes */}
            {savedSchemes.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text style={s.sectionTitle}>SAVED SCHEMES</Text>
                {savedSchemes.map(sch => (
                  <TouchableOpacity key={sch._id} style={[s.schemeChip, activeScheme?._id === sch._id && s.schemeChipActive]}
                    onPress={() => { setActiveScheme(sch); setCurrentStep(3); }}>
                    <View style={[s.statusDot, { backgroundColor: sch.status === 'ready' ? '#10B981' : '#F59E0B' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.schemeChipTitle}>{sch.subject} · {sch.classCode}</Text>
                      <Text style={s.schemeChipSub}>Term {sch.term} · {sch.totalWeeks || 0} weeks</Text>
                    </View>
                    <Text style={{ color: C.g2, fontSize: 13, fontWeight: '700' }}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── STEP 2: Parsing ───────────────────────────────── */}
        {currentStep === 2 && (
          <View style={[s.card, { alignItems: 'center', paddingVertical: 60 }]}>
            <ActivityIndicator size="large" color={C.g2} />
            <Text style={[s.cardTitle, { marginTop: 24, textAlign: 'center' }]}>AI is Reading Your Scheme</Text>
            <Text style={[s.cardSub, { textAlign: 'center' }]}>Extracting week-by-week breakdown.{'\n'}This takes 30–60 seconds.</Text>
            <View style={s.progressBarWrap}>
              <View style={s.progressBarFill} />
            </View>
          </View>
        )}

        {/* ── STEP 3: Review ────────────────────────────────── */}
        {currentStep === 3 && activeScheme && (
          <View style={s.card}>
            <View style={s.schemeHeader}>
              <View>
                <Text style={s.cardTitle}>{activeScheme.subject}</Text>
                <Text style={s.cardSub}>{activeScheme.classCode} · Term {activeScheme.term} · {wb.length} weeks</Text>
              </View>
              <View style={s.readyBadge}><Text style={s.readyBadgeText}>Ready</Text></View>
            </View>

            <Text style={[s.sectionTitle, { marginTop: 16 }]}>PARSED WEEKS</Text>
            <View style={s.weekGrid}>
              {wb.map(week => (
                <View key={week.week} style={s.weekCard}>
                  <Text style={s.weekCardNum}>W{week.week}</Text>
                  <Text style={s.weekCardStrand} numberOfLines={2}>{week.strand || '—'}</Text>
                  {week.topics?.length > 0 && <Text style={s.weekCardTopic} numberOfLines={1}>{week.topics[0]}</Text>}
                </View>
              ))}
            </View>

            <View style={s.btnRow}>
              <TouchableOpacity style={s.outlineBtn} onPress={() => setCurrentStep(1)}>
                <Text style={s.outlineBtnText}>← Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.primaryBtn, { flex: 1 }]} onPress={() => setCurrentStep(4)}>
                <Text style={s.primaryBtnText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── STEP 4: Generate ──────────────────────────────── */}
        {currentStep === 4 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Generate Lesson Notes</Text>
            <Text style={s.cardSub}>Choose which weeks to generate from {activeScheme?.subject} · {activeScheme?.classCode}</Text>

            {/* Mode */}
            <Text style={[s.sectionTitle, { marginTop: 16 }]}>GENERATION MODE</Text>
            <View style={s.modeRow}>
              {[['single','Single'], ['range','Range'], ['full','Full Term']].map(([k, l]) => (
                <TouchableOpacity key={k} onPress={() => setGenMode(k)} style={[s.modePill, genMode === k && s.modePillActive]}>
                  <Text style={[s.modePillText, genMode === k && s.modePillTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {genMode === 'single' && (
              <View>
                <Text style={[s.sectionTitle, { marginTop: 12 }]}>SELECT WEEK</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
                  {wb.map(w => (
                    <TouchableOpacity key={w.week} onPress={() => setSingleWeek(w.week)} style={[s.weekNumBtn, singleWeek === w.week && s.weekNumBtnActive]}>
                      <Text style={[s.weekNumBtnText, singleWeek === w.week && { color: C.white }]}>{w.week}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {genMode === 'range' && (
              <View style={s.rangeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>FROM WEEK</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {wb.map(w => (
                      <TouchableOpacity key={w.week} onPress={() => setWeekFrom(w.week)} style={[s.weekNumBtn, { width: 36 }, weekFrom === w.week && s.weekNumBtnActive]}>
                        <Text style={[s.weekNumBtnText, weekFrom === w.week && { color: C.white }]}>{w.week}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>TO WEEK</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {wb.filter(w => w.week >= weekFrom).map(w => (
                      <TouchableOpacity key={w.week} onPress={() => setWeekTo(w.week)} style={[s.weekNumBtn, { width: 36 }, weekTo === w.week && s.weekNumBtnActive]}>
                        <Text style={[s.weekNumBtnText, weekTo === w.week && { color: C.white }]}>{w.week}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {genMode === 'full' && (
              <View style={s.fullNotice}>
                <Text style={s.fullNoticeText}>All {wb.length} weeks will be generated. This may take several minutes.</Text>
              </View>
            )}

            {/* Teaching Days */}
            <Text style={[s.sectionTitle, { marginTop: 16 }]}>TEACHING DAYS / WEEK</Text>
            <View style={s.termRow}>
              {['1','2','3','4','5'].map(d => (
                <TouchableOpacity key={d} onPress={() => setTeachingDays(d)} style={[s.termPill, teachingDays === d && s.termPillActive]}>
                  <Text style={[s.termPillText, teachingDays === d && s.termPillTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.summaryBox}>
              <Text style={s.summaryText}>
                Generating <Text style={{ fontWeight: '800', color: C.g1 }}>
                  {genMode === 'full' ? wb.length : genMode === 'single' ? 1 : wb.filter(w => w.week >= weekFrom && w.week <= weekTo).length}
                </Text> lessons · {activeScheme?.subject} · {activeScheme?.classCode}
              </Text>
            </View>

            <View style={s.btnRow}>
              <TouchableOpacity style={s.outlineBtn} onPress={() => setCurrentStep(3)}>
                <Text style={s.outlineBtnText}>← Review</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.genBtn, generating && { opacity: 0.6 }, { flex: 1 }]} onPress={handleGenerate} disabled={generating}>
                {generating ? <ActivityIndicator color={C.white} size="small" /> : <Text style={s.genBtnText}>Generate Lessons →</Text>}
              </TouchableOpacity>
            </View>
            {generating && <Text style={s.genHint}>Each lesson takes ~15s. Please wait.</Text>}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  stepBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, backgroundColor: C.white, borderBottomWidth: 1, borderColor: C.bg3, gap: 4 },
  stepItem: { flex: 1, alignItems: 'center', gap: 4 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.bg3, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: C.g2 },
  stepDotDone: { backgroundColor: C.g4 },
  stepNum: { fontSize: 11, fontWeight: '800', color: C.ink3 },
  stepCheck: { fontSize: 12, color: C.g2, fontWeight: '800' },
  stepLbl: { fontSize: 9, fontWeight: '700', color: C.ink4, textTransform: 'uppercase', letterSpacing: 0.4 },
  stepLblActive: { color: C.g2 },
  scroll: { padding: 16 },
  card: { backgroundColor: C.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.bg3, ...shadow },
  cardTitle: { fontSize: 18, fontWeight: '800', color: C.g1, marginBottom: 6 },
  cardSub: { fontSize: 13, color: C.ink3, lineHeight: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: C.ink4, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  row2: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  picker: { flex: 1, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.bg3, borderRadius: 12, padding: 12, minHeight: 56, justifyContent: 'flex-end' },
  pickerFilled: { borderColor: C.g2, backgroundColor: C.g4 },
  label: { fontSize: 9, fontWeight: '800', color: C.ink4, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  pickerVal: { fontSize: 14, fontWeight: '600', color: C.ink },
  termRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  termPill: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: C.bg3, alignItems: 'center', backgroundColor: C.bg },
  termPillActive: { borderColor: C.g2, backgroundColor: C.g4 },
  termPillText: { fontSize: 13, fontWeight: '600', color: C.ink3 },
  termPillTextActive: { color: C.g1, fontWeight: '800' },
  tabRow: { flexDirection: 'row', backgroundColor: C.bg3, borderRadius: 12, padding: 3, gap: 3, marginBottom: 12 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  tabBtnActive: { backgroundColor: C.white },
  tabBtnText: { fontSize: 13, fontWeight: '600', color: C.ink3 },
  tabBtnTextActive: { color: C.g1, fontWeight: '800' },
  textArea: { backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.bg3, borderRadius: 14, padding: 14, fontSize: 13, color: C.ink, minHeight: 140, marginBottom: 16 },
  fileZone: { borderWidth: 2, borderStyle: 'dashed', borderColor: C.bg3, borderRadius: 16, padding: 30, alignItems: 'center', marginBottom: 16, backgroundColor: C.bg },
  fileIcon: { fontSize: 32, marginBottom: 4 },
  fileName: { fontSize: 13, fontWeight: '700', color: C.ink, textAlign: 'center' },
  fileSub: { fontSize: 11, color: C.ink3 },
  fileZoneTitle: { fontSize: 14, fontWeight: '700', color: C.ink2 },
  fileZoneSub: { fontSize: 12, color: C.ink4 },
  primaryBtn: { backgroundColor: C.g2, borderRadius: 14, paddingVertical: 15, alignItems: 'center', shadowColor: C.g2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  primaryBtnText: { color: C.white, fontSize: 15, fontWeight: '800' },
  schemeChip: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: C.bg3, backgroundColor: C.bg, marginBottom: 8 },
  schemeChipActive: { borderColor: C.g2, backgroundColor: C.g4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  schemeChipTitle: { fontSize: 13, fontWeight: '700', color: C.ink },
  schemeChipSub: { fontSize: 11, color: C.ink3 },
  progressBarWrap: { width: 220, height: 4, backgroundColor: C.bg3, borderRadius: 2, marginTop: 24, overflow: 'hidden' },
  progressBarFill: { width: '75%', height: '100%', backgroundColor: C.g2, borderRadius: 2 },
  schemeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  readyBadge: { backgroundColor: C.g4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  readyBadgeText: { fontSize: 11, fontWeight: '800', color: C.g2 },
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  weekCard: { width: (width - 80) / 3, backgroundColor: C.bg, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: C.bg3 },
  weekCardNum: { fontSize: 11, fontWeight: '900', color: C.g2, marginBottom: 4 },
  weekCardStrand: { fontSize: 10, fontWeight: '600', color: C.ink, lineHeight: 14 },
  weekCardTopic: { fontSize: 9, color: C.ink3, marginTop: 3 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  outlineBtn: { borderWidth: 1.5, borderColor: C.bg3, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  outlineBtnText: { fontSize: 14, fontWeight: '700', color: C.ink2 },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  modePill: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: C.bg3, alignItems: 'center' },
  modePillActive: { borderColor: C.violet, backgroundColor: C.violetL },
  modePillText: { fontSize: 12, fontWeight: '600', color: C.ink3 },
  modePillTextActive: { color: C.violet, fontWeight: '800' },
  rangeRow: { gap: 12, marginBottom: 8 },
  weekNumBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.bg3, alignItems: 'center', justifyContent: 'center' },
  weekNumBtnActive: { backgroundColor: C.g2, borderColor: C.g2 },
  weekNumBtnText: { fontSize: 13, fontWeight: '800', color: C.ink3 },
  fullNotice: { backgroundColor: '#EDE9FE', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#DDD6FE' },
  fullNoticeText: { fontSize: 13, color: '#5B21B6', fontWeight: '500', lineHeight: 20 },
  summaryBox: { backgroundColor: C.bg, borderRadius: 12, padding: 12, marginTop: 16, marginBottom: 4, borderWidth: 1, borderColor: C.bg3 },
  summaryText: { fontSize: 13, color: C.ink3 },
  genBtn: { backgroundColor: C.gd, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', shadowColor: C.gd, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  genBtnText: { color: C.g1, fontSize: 15, fontWeight: '800' },
  genHint: { textAlign: 'center', fontSize: 11, color: C.ink4, marginTop: 10 },
});
