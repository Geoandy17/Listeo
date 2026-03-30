import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import DatePickerField from '../components/DatePickerField';
import { searchImei, searchImeiPdf, shareFile } from '../services/api';
import { SearchJsonResponse } from '../types';

type ReqStatus = 'loading' | 'success' | 'error';

interface SearchRequest {
  id: number;
  imei: string;
  startDate: string;
  endDate: string;
  status: ReqStatus;
  error?: string;
  data?: SearchJsonResponse;
  recordCount?: number;
  actionsOpen: boolean;
  pdfLoading: boolean;
  pdfUri?: string;
}

let nextId = 1;

export default function SearchImeiScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [imei, setImei] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [requests, setRequests] = useState<SearchRequest[]>([]);

  function formatDateForApi(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function formatShortDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  function updateRequest(id: number, update: Partial<SearchRequest>) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...update } : r));
  }

  async function handleSearch() {
    const val = imei.trim();
    if (!val) { Alert.alert('Erreur', 'Veuillez saisir un numéro IMEI'); return; }
    if (val.length < 5) { Alert.alert('Erreur', "L'IMEI doit contenir au moins 5 chiffres"); return; }

    const id = nextId++;
    const sDate = formatDateForApi(startDate);
    const eDate = formatDateForApi(endDate);

    const newReq: SearchRequest = {
      id, imei: val, startDate: sDate, endDate: eDate,
      status: 'loading', actionsOpen: false, pdfLoading: false,
    };

    setRequests(prev => [newReq, ...prev]);
    setImei('');

    try {
      const result = await searchImei({ imei: val, startDate: sDate, endDate: eDate });
      updateRequest(id, { status: 'success', data: result, recordCount: result.totalCount });
    } catch (err: any) {
      updateRequest(id, { status: 'error', error: err.message || 'Erreur inconnue' });
    }
  }

  function toggleActions(id: number) {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, actionsOpen: !r.actionsOpen } : { ...r, actionsOpen: false }
    ));
  }

  function handleViewResults(req: SearchRequest) {
    if (req.data) {
      updateRequest(req.id, { actionsOpen: false });
      navigation.navigate('Results', { data: req.data, type: 'imei' });
    }
  }

  async function fetchPdfUri(req: SearchRequest): Promise<string | null> {
    if (req.pdfUri) return req.pdfUri;
    updateRequest(req.id, { pdfLoading: true });
    try {
      const uri = await searchImeiPdf({ imei: req.imei, startDate: req.startDate, endDate: req.endDate });
      updateRequest(req.id, { pdfUri: uri, pdfLoading: false });
      return uri;
    } catch (err: any) {
      Alert.alert('Erreur', err.message);
      updateRequest(req.id, { pdfLoading: false });
      return null;
    }
  }

  async function handleViewPdf(req: SearchRequest) {
    updateRequest(req.id, { actionsOpen: false });
    const uri = await fetchPdfUri(req);
    if (uri) {
      navigation.navigate('PdfViewer', { fileUri: uri, title: `CDR IMEI - ${req.imei}` });
    }
  }

  async function handleDownloadPdf(req: SearchRequest) {
    updateRequest(req.id, { actionsOpen: false });
    const uri = await fetchPdfUri(req);
    if (uri) {
      try { await shareFile(uri); } catch { /* cancelled */ }
    }
  }

  async function handleRetry(req: SearchRequest) {
    updateRequest(req.id, { status: 'loading', error: undefined });
    try {
      const result = await searchImei({ imei: req.imei, startDate: req.startDate, endDate: req.endDate });
      updateRequest(req.id, { status: 'success', data: result, recordCount: result.totalCount });
    } catch (err: any) {
      updateRequest(req.id, { status: 'error', error: err.message || 'Erreur inconnue' });
    }
  }

  function handleRemove(id: number) {
    setRequests(prev => prev.filter(r => r.id !== id));
  }

  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <View style={styles.circle1} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Recherche par IMEI</Text>
          <Text style={styles.pageSubtitle}>Identifiez les CDR d'un appareil mobile</Text>
        </View>

        {/* ─── Form ─── */}
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Numéro IMEI</Text>
            <View style={[styles.inputWrapper, focusedField === 'imei' && styles.inputFocused]}>
              <Ionicons name="phone-portrait-outline" size={18} color={focusedField === 'imei' ? '#34D399' : 'rgba(255,255,255,0.3)'} />
              <TextInput
                style={styles.input}
                placeholder="352264490343030"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={imei}
                onChangeText={setImei}
                keyboardType="numeric"
                onFocus={() => setFocusedField('imei')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <Text style={styles.hint}>Minimum 5 chiffres</Text>
          </View>

          <DatePickerField label="Date & heure début" value={startDate} onChange={setStartDate} />
          <DatePickerField label="Date & heure fin" value={endDate} onChange={setEndDate} />

          <TouchableOpacity onPress={handleSearch} activeOpacity={0.85}>
            <LinearGradient
              colors={['#34D399', '#10B981']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.searchButton}
            >
              <Ionicons name="search" size={18} color="#FFF" />
              <Text style={styles.searchButtonText}>Rechercher</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ─── Requests Queue ─── */}
        {requests.length > 0 && (
          <View style={styles.queueCard}>
            <View style={styles.queueHeader}>
              <Text style={styles.queueTitle}>Mes requêtes</Text>
              <View style={styles.queueBadge}>
                <Text style={styles.queueBadgeText}>{requests.length}</Text>
              </View>
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.thCell, { flex: 1.5 }]}>IMEI</Text>
              <Text style={[styles.thCell, { flex: 1 }]}>Période</Text>
              <Text style={[styles.thCell, { flex: 0.8, textAlign: 'center' }]}>Statut</Text>
              <Text style={[styles.thCell, { flex: 0.5, textAlign: 'center' }]}></Text>
            </View>

            {requests.map((req, idx) => (
              <View key={req.id}>
                <View style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                  <Text style={[styles.tdCell, { flex: 1.5, fontWeight: '600' }]} numberOfLines={1}>{req.imei}</Text>
                  <Text style={[styles.tdCell, { flex: 1 }]} numberOfLines={1}>
                    {formatShortDate(req.startDate)} - {formatShortDate(req.endDate)}
                  </Text>
                  <View style={{ flex: 0.8, alignItems: 'center' }}>
                    {req.status === 'loading' && (
                      <View style={[styles.statusPill, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                        <ActivityIndicator size={10} color="#F59E0B" />
                        <Text style={[styles.statusText, { color: '#F59E0B' }]}>En cours</Text>
                      </View>
                    )}
                    {req.status === 'success' && (
                      <View style={[styles.statusPill, { backgroundColor: 'rgba(52,211,153,0.15)' }]}>
                        <Ionicons name="checkmark-circle" size={12} color="#34D399" />
                        <Text style={[styles.statusText, { color: '#34D399' }]}>{req.recordCount} rés.</Text>
                      </View>
                    )}
                    {req.status === 'error' && (
                      <View style={[styles.statusPill, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                        <Ionicons name="close-circle" size={12} color="#EF4444" />
                        <Text style={[styles.statusText, { color: '#EF4444' }]}>Échoué</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 0.5, alignItems: 'center' }}>
                    {req.status === 'success' && (
                      <TouchableOpacity onPress={() => toggleActions(req.id)} style={styles.actionsDot} activeOpacity={0.7}>
                        <Ionicons name="ellipsis-vertical" size={18} color="rgba(255,255,255,0.5)" />
                      </TouchableOpacity>
                    )}
                    {req.status === 'error' && (
                      <TouchableOpacity onPress={() => handleRetry(req)} style={styles.actionsDot} activeOpacity={0.7}>
                        <Ionicons name="refresh" size={16} color="#34D399" />
                      </TouchableOpacity>
                    )}
                    {req.status === 'loading' && (
                      <TouchableOpacity onPress={() => handleRemove(req.id)} style={styles.actionsDot} activeOpacity={0.7}>
                        <Ionicons name="close" size={16} color="rgba(255,255,255,0.25)" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {req.actionsOpen && req.status === 'success' && (
                  <View style={styles.dropdown}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleViewResults(req)} activeOpacity={0.7}>
                      <Ionicons name="list-outline" size={16} color="#34D399" />
                      <Text style={styles.dropdownText}>Voir les résultats</Text>
                    </TouchableOpacity>
                    <View style={styles.dropdownDivider} />
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleViewPdf(req)} activeOpacity={0.7} disabled={req.pdfLoading}>
                      <Ionicons name="eye-outline" size={16} color="#667EEA" />
                      <Text style={styles.dropdownText}>{req.pdfLoading ? 'Chargement...' : 'Voir PDF'}</Text>
                    </TouchableOpacity>
                    <View style={styles.dropdownDivider} />
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleDownloadPdf(req)} activeOpacity={0.7} disabled={req.pdfLoading}>
                      <Ionicons name="download-outline" size={16} color="#A78BFA" />
                      <Text style={styles.dropdownText}>{req.pdfLoading ? 'Chargement...' : 'Télécharger PDF'}</Text>
                    </TouchableOpacity>
                    <View style={styles.dropdownDivider} />
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => handleRemove(req.id)} activeOpacity={0.7}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      <Text style={[styles.dropdownText, { color: 'rgba(239,68,68,0.8)' }]}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {req.status === 'error' && (
                  <View style={styles.errorRow}>
                    <Ionicons name="warning-outline" size={12} color="#EF4444" />
                    <Text style={styles.errorText} numberOfLines={1}>{req.error}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  circle1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(52,211,153,0.08)', top: -80, left: -60 },
  scroll: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 40 },
  pageHeader: { marginBottom: 24 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  formCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.55)', marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 14, height: 50, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', gap: 10 },
  inputFocused: { borderColor: 'rgba(52,211,153,0.5)', backgroundColor: 'rgba(52,211,153,0.06)' },
  input: { flex: 1, color: '#FFFFFF', fontSize: 15, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}) },
  hint: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 6, marginLeft: 4 },
  searchButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 16, gap: 10 },
  searchButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  // Queue
  queueCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  queueHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  queueTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  queueBadge: { backgroundColor: 'rgba(52,211,153,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  queueBadgeText: { color: '#34D399', fontSize: 12, fontWeight: '700' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)' },
  thCell: { color: '#34D399', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.04)' },
  tableRowEven: { backgroundColor: 'rgba(255,255,255,0.02)' },
  tdCell: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  actionsDot: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  dropdown: { marginHorizontal: 16, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  dropdownText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  dropdownDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingBottom: 8 },
  errorText: { color: 'rgba(239,68,68,0.7)', fontSize: 11 },
});
