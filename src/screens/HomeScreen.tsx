import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TabParamList } from '../navigation/AppNavigator';

const _screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<TabParamList>>();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <LinearGradient
      colors={['#0F0C29', '#302B63', '#24243E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.userName}>{user?.fullName}</Text>
              <View style={styles.serviceBadge}>
                <Ionicons name="business-outline" size={12} color="#667EEA" />
                <Text style={styles.serviceText}>{user?.serviceName}</Text>
              </View>
            </View>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View style={[styles.statsRow, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(102,126,234,0.15)', 'rgba(102,126,234,0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="analytics-outline" size={22} color="#667EEA" />
              <Text style={styles.statLabel}>Plateforme</Text>
              <Text style={styles.statValue}>CDR</Text>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(52,211,153,0.15)', 'rgba(52,211,153,0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="shield-checkmark-outline" size={22} color="#34D399" />
              <Text style={styles.statLabel}>Statut</Text>
              <Text style={[styles.statValue, { color: '#34D399' }]}>Actif</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          <Text style={styles.sectionTitle}>Recherche rapide</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SearchNumber')}
          >
            <LinearGradient
              colors={['rgba(102,126,234,0.12)', 'rgba(118,75,162,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionCard}
            >
              <View style={styles.actionIconWrap}>
                <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.actionIcon}>
                  <Ionicons name="call" size={22} color="#FFF" />
                </LinearGradient>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Recherche par Numéro</Text>
                <Text style={styles.actionDesc}>
                  Analysez les CDR d'un ou plusieurs numéros de téléphone
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SearchImei')}
          >
            <LinearGradient
              colors={['rgba(52,211,153,0.12)', 'rgba(16,185,129,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionCard}
            >
              <View style={styles.actionIconWrap}>
                <LinearGradient colors={['#34D399', '#10B981']} style={styles.actionIcon}>
                  <Ionicons name="phone-portrait" size={22} color="#FFF" />
                </LinearGradient>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Recherche par IMEI</Text>
                <Text style={styles.actionDesc}>
                  Identifiez les CDR d'un appareil via son numéro IMEI
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Info card */}
        <Animated.View style={[styles.infoCard, { opacity: fadeIn }]}>
          <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.4)" />
          <Text style={styles.infoText}>
            Sélectionnez un type de recherche pour commencer l'analyse des données CDR.
          </Text>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(102,126,234,0.08)',
    top: -100,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(118,75,162,0.06)',
    bottom: 100,
    left: -60,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 24,
  },
  // Header
  header: {
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102,126,234,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 5,
  },
  serviceText: {
    color: '#667EEA',
    fontSize: 12,
    fontWeight: '600',
  },
  avatarContainer: {
    marginLeft: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
  },
  statGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 10,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  // Section
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  // Action Cards
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionIconWrap: {
    marginRight: 14,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionDesc: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  // Info
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    lineHeight: 18,
  },
});
