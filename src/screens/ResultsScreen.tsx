import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchJsonResponse, SearchGroupJsonResponse, CDRRecord } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

function RecordCard({ record, index }: { record: CDRRecord; index: number }) {
  const entries = Object.entries(record);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>#{index + 1}</Text>
        </View>
      </View>
      {entries.map(([key, value]) => (
        <View key={key} style={styles.row}>
          <Text style={styles.key}>{key}</Text>
          <Text style={styles.value} numberOfLines={2}>{String(value ?? '-')}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ResultsScreen({ route }: Props) {
  const { data } = route.params;
  const isGrouped = 'groupedResults' in data;

  if (isGrouped) {
    const grouped = data as SearchGroupJsonResponse;
    return (
      <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={styles.container}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="layers-outline" size={18} color="#667EEA" />
              <Text style={styles.summaryLabel}>Groupes</Text>
              <Text style={styles.summaryValue}>{grouped.totalGroups}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Ionicons name="timer-outline" size={18} color="#34D399" />
              <Text style={styles.summaryLabel}>Temps</Text>
              <Text style={styles.summaryValue}>{grouped.tookMs}ms</Text>
            </View>
          </View>
        </View>
        <FlatList
          data={grouped.groupedResults}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.groupSection}>
              <View style={styles.groupHeader}>
                <Ionicons name="call" size={16} color="#667EEA" />
                <Text style={styles.groupPhone}>{item.phoneNumber}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{item.recordCount}</Text>
                </View>
              </View>
              {item.records.map((record, idx) => (
                <RecordCard key={idx} record={record} index={idx} />
              ))}
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      </LinearGradient>
    );
  }

  const single = data as SearchJsonResponse;
  return (
    <LinearGradient colors={['#0F0C29', '#302B63', '#24243E']} style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Ionicons name="documents-outline" size={18} color="#667EEA" />
            <Text style={styles.summaryLabel}>Résultats</Text>
            <Text style={styles.summaryValue}>{single.totalCount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="timer-outline" size={18} color="#34D399" />
            <Text style={styles.summaryLabel}>Temps</Text>
            <Text style={styles.summaryValue}>{single.summary.tookMs}ms</Text>
          </View>
          {single.mainPhone && (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Ionicons name="call-outline" size={18} color="#A78BFA" />
                <Text style={styles.summaryLabel}>Numéro</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>{single.mainPhone}</Text>
              </View>
            </>
          )}
        </View>
      </View>
      <FlatList
        data={single.records}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => <RecordCard record={item} index={index} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.15)" />
            <Text style={styles.empty}>Aucun enregistrement trouvé</Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Summary
  summaryCard: {
    marginHorizontal: 16, marginTop: 12, marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '500' },
  summaryValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  summaryDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.08)' },
  // List
  list: { padding: 16, paddingBottom: 32 },
  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: { marginBottom: 10 },
  indexBadge: {
    backgroundColor: 'rgba(102,126,234,0.15)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
    alignSelf: 'flex-start',
  },
  indexText: { color: '#667EEA', fontSize: 12, fontWeight: '700' },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 5, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  key: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.4)', flex: 1 },
  value: { fontSize: 13, color: '#FFFFFF', flex: 1.5, textAlign: 'right', fontWeight: '500' },
  // Groups
  groupSection: { marginBottom: 20 },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(102,126,234,0.1)',
    borderRadius: 14, padding: 14, marginBottom: 8, gap: 10,
    borderWidth: 1, borderColor: 'rgba(102,126,234,0.15)',
  },
  groupPhone: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', flex: 1 },
  countBadge: {
    backgroundColor: 'rgba(102,126,234,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  countText: { color: '#667EEA', fontSize: 12, fontWeight: '700' },
  // Empty
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 12 },
  empty: { color: 'rgba(255,255,255,0.3)', fontSize: 16, fontWeight: '500' },
});
