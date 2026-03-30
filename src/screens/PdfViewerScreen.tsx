import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { shareFile } from '../services/api';
import { WebView } from 'react-native-webview';

type Props = NativeStackScreenProps<RootStackParamList, 'PdfViewer'>;

export default function PdfViewerScreen({ route, navigation }: Props) {
  const { fileUri, title } = route.params;
  const [externalOpened, setExternalOpened] = useState(false);

  // Android: WebView can't render PDFs, so open with system viewer automatically
  useEffect(() => {
    if (Platform.OS === 'android') {
      openExternal();
    }
  }, []);

  async function openExternal() {
    try {
      await shareFile(fileUri);
      setExternalOpened(true);
    } catch {
      // sharing cancelled or unavailable
    }
  }

  async function handleShare() {
    try {
      await shareFile(fileUri);
    } catch {
      // sharing cancelled or unavailable
    }
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <LinearGradient
        colors={['#0F0C29', '#1A1744']}
        style={styles.topBar}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.titleArea}>
          <Ionicons name="document-text" size={16} color="#667EEA" />
          <Text style={styles.title} numberOfLines={1}>{title || 'Document PDF'}</Text>
        </View>

        <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.7}>
          <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.shareBtnGradient}>
            <Ionicons name="download-outline" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* PDF Viewer */}
      {Platform.OS === 'web' ? (
        // Web: use iframe
        // @ts-ignore
        <iframe
          src={fileUri}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          title="PDF Viewer"
        />
      ) : Platform.OS === 'android' ? (
        // Android: WebView can't render PDFs, show open-externally UI
        <View style={styles.androidFallback}>
          <View style={styles.androidCard}>
            <Ionicons name="document-text-outline" size={64} color="#667EEA" />
            <Text style={styles.androidTitle}>PDF prêt</Text>
            <Text style={styles.androidSubtitle}>
              {externalOpened
                ? 'Le PDF a été ouvert dans votre lecteur PDF.'
                : 'Appuyez ci-dessous pour ouvrir le PDF avec votre lecteur.'}
            </Text>
            <TouchableOpacity onPress={openExternal} activeOpacity={0.85}>
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.openBtn}
              >
                <Ionicons name="open-outline" size={18} color="#FFF" />
                <Text style={styles.openBtnText}>Ouvrir le PDF</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // iOS: WebView can render PDF natively
        <WebView
          source={{ uri: fileUri }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#667EEA" />
              <Text style={styles.loadingText}>Chargement du PDF...</Text>
            </View>
          )}
          originWhitelist={['*']}
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
        />
      )}

      {/* Bottom action bar */}
      <LinearGradient
        colors={['#1A1744', '#0F0C29']}
        style={styles.bottomBar}
      >
        <TouchableOpacity onPress={handleShare} style={styles.bottomAction} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={20} color="rgba(255,255,255,0.6)" />
          <Text style={styles.bottomActionText}>Partager</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.bottomAction} activeOpacity={0.7}>
          <Ionicons name="download-outline" size={20} color="#667EEA" />
          <Text style={[styles.bottomActionText, { color: '#667EEA' }]}>Télécharger</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0C29' },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  titleArea: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  title: {
    color: '#FFFFFF', fontSize: 16, fontWeight: '700', flex: 1,
  },
  shareBtn: {},
  shareBtnGradient: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  // WebView
  webview: { flex: 1, backgroundColor: '#1A1744' },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0C29',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '500' },
  // Android fallback
  androidFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  androidCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    width: '100%',
  },
  androidTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  androidSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 16,
    gap: 10,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  openBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 14,
    paddingHorizontal: 32,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  bottomAction: { alignItems: 'center', gap: 4 },
  bottomActionText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
});
