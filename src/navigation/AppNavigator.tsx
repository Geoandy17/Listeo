import React, { useState } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { SearchJsonResponse, SearchGroupJsonResponse } from '../types';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchNumberScreen from '../screens/SearchNumberScreen';
import SearchImeiScreen from '../screens/SearchImeiScreen';
import ResultsScreen from '../screens/ResultsScreen';
import PdfViewerScreen from '../screens/PdfViewerScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Results: {
    data: SearchJsonResponse | SearchGroupJsonResponse;
    type: 'number' | 'imei';
  };
  PdfViewer: {
    fileUri: string;
    title?: string;
  };
};

export type TabParamList = {
  Home: undefined;
  SearchNumber: undefined;
  SearchImei: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabBarBackground() {
  return (
    <LinearGradient
      colors={['rgba(15,12,41,0.98)', 'rgba(48,43,99,0.98)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'SearchNumber':
              iconName = focused ? 'call' : 'call-outline';
              break;
            case 'SearchImei':
              iconName = focused ? 'phone-portrait' : 'phone-portrait-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667EEA',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen
        name="SearchNumber"
        component={SearchNumberScreen}
        options={{ tabBarLabel: 'Numéro' }}
      />
      <Tab.Screen
        name="SearchImei"
        component={SearchImeiScreen}
        options={{ tabBarLabel: 'IMEI' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0C29' }}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  if (!isAuthenticated) {
    if (!showLogin) {
      return <WelcomeScreen onGetStarted={() => setShowLogin(true)} />;
    }
    return <LoginScreen onBack={() => setShowLogin(false)} />;
  }

  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#0F0C29',
      card: '#1A1744',
      text: '#FFFFFF',
      border: 'rgba(255,255,255,0.08)',
      primary: '#667EEA',
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{
            title: 'Résultats',
            headerStyle: { backgroundColor: '#0F0C29' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
        <Stack.Screen
          name="PdfViewer"
          component={PdfViewerScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
