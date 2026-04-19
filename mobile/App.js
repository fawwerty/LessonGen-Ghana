import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Text, ActivityIndicator, View, TouchableOpacity,
  Linking, Alert, StyleSheet
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/utils/AuthContext';
import { colors } from './src/utils/theme';
import { paymentAPI } from './src/services/api';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import GenerateScreen from './src/screens/GenerateScreen';
import MyLessonsScreen from './src/screens/MyLessonsScreen';
import LessonViewScreen from './src/screens/LessonViewScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SchemeScreen from './src/screens/SchemeScreen';
import DashboardScreen from './src/screens/DashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

import { Ionicons } from '@expo/vector-icons';

// ── Minimalistic Tab Icons ────────────────────────────────────────────────────
function TabIcon({ name, focused }) {
  const icons = {
    Home: focused ? 'home' : 'home-outline',
    Generate: focused ? 'flash' : 'flash-outline',
    Scheme: focused ? 'list' : 'list-outline',
    'My Lessons': focused ? 'book' : 'book-outline',
    Profile: focused ? 'person' : 'person-outline',
  };
  
  const iconName = icons[name] || 'help-circle-outline';

  return (
    <View style={[ti.wrap, focused && ti.wrapActive]}>
      <Ionicons name={iconName} size={20} color={focused ? colors.g1 : colors.ink3} />
    </View>
  );
}

const ti = StyleSheet.create({
  wrap: {
    width: 44, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  wrapActive: { backgroundColor: colors.g4 },
  icon: { fontSize: 16, fontWeight: '900', color: colors.ink3 },
  iconActive: { color: colors.g1 },
});

// ── Main Tab Navigator ────────────────────────────────────────────────────────
function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.g1,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.bg3,
          borderTopWidth: 1,
          height: 60 + (insets.bottom || 20),
          paddingBottom: (insets.bottom || 20) + 6,
          paddingTop: 6,
          elevation: 12,
          shadowColor: colors.g1,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        headerStyle: { backgroundColor: colors.g1 },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ title: 'My Dashboard', tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Generate"
        component={GenerateScreen}
        options={{ title: 'LessonGen', tabBarLabel: 'Generate' }}
      />
      <Tab.Screen
        name="Scheme"
        component={SchemeScreen}
        options={{ title: 'Scheme', tabBarLabel: 'Scheme' }}
      />
      <Tab.Screen
        name="My Lessons"
        component={MyLessonsScreen}
        options={{ title: 'My Archive', tabBarLabel: 'Lessons' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile', tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────────
function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.g1 },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="LessonView"
            component={LessonViewScreen}
            options={{ title: 'Lesson Note', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ title: 'Upgrade to PRO', headerBackTitle: 'Back' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// ── Initializing Overlay ─────────────────────────────────────────────────────
function InitializingOverlay() {
  const { loading } = useAuth();
  if (!loading) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.g1, zIndex: 9999, alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator color={colors.gd} size="large" />
      <Text style={{ color: colors.gd, marginTop: 16, fontWeight: '700', fontSize: 14 }}>Initializing...</Text>
    </View>
  );
}

// ── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.g1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
          <InitializingOverlay />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ── Payment Screen (inline) ───────────────────────────────────────────────────
function PaymentScreen({ navigation }) {
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState('monthly');
  const insets = useSafeAreaInsets();

  const pay = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.paystackInit(plan);
      await Linking.openURL(res.data.authorizationUrl);
    } catch {
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[pay_s.container, { paddingBottom: insets.bottom + 20 }]}>
      <Text style={pay_s.title}>Upgrade to PRO</Text>
      <Text style={pay_s.sub}>Unlock unlimited lesson note exports with DOCX download.</Text>

      {[
        ['monthly', 'Monthly', 'GHS 25 / month'],
        ['annual', 'Annual', 'GHS 200 / year  ·  Save GHS 100'],
      ].map(([val, label, price]) => (
        <TouchableOpacity
          key={val}
          onPress={() => setPlan(val)}
          style={[pay_s.planCard, plan === val && pay_s.planCardActive]}
        >
          <View style={[pay_s.planRadio, plan === val && pay_s.planRadioActive]} />
          <View style={{ flex: 1 }}>
            <Text style={[pay_s.planLabel, plan === val && { color: colors.g1, fontWeight: '800' }]}>{label}</Text>
            <Text style={pay_s.planPrice}>{price}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[pay_s.payBtn, loading && { opacity: 0.6 }]} onPress={pay} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={pay_s.payBtnText}>Pay with Paystack  →</Text>}
      </TouchableOpacity>
    </View>
  );
}

const pay_s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '900', color: colors.g1, marginBottom: 6 },
  sub: { fontSize: 13, color: colors.ink3, marginBottom: 28, lineHeight: 20 },
  planCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 18, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 2, borderColor: colors.bg3,
  },
  planCardActive: { borderColor: colors.g2, backgroundColor: colors.g4 },
  planRadio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.bg3,
    alignItems: 'center', justifyContent: 'center',
  },
  planRadioActive: { borderColor: colors.g2, backgroundColor: colors.g2 },
  planLabel: { fontSize: 15, fontWeight: '700', color: colors.ink2, marginBottom: 2 },
  planPrice: { fontSize: 13, color: colors.ink3, fontWeight: '500' },
  payBtn: {
    backgroundColor: '#0099FF', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8,
    shadowColor: '#0099FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
