import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { AuthProvider, useAuth } from './src/utils/AuthContext';
import { colors } from './src/utils/theme';
import { paymentAPI } from './src/services/api';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import GenerateScreen from './src/screens/GenerateScreen';
import MyLessonsScreen from './src/screens/MyLessonsScreen';
import LessonViewScreen from './src/screens/LessonViewScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  const icons = { Generate: '✨', 'My Lessons': '📚', Profile: '👤' };
  return (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: focused ? colors.g4 : 'transparent',
      paddingHorizontal: 16,
      paddingVertical: 4,
      borderRadius: 12,
    }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{icons[name]}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.g1,
        tabBarInactiveTintColor: colors.ink3,
        tabBarStyle: { 
          backgroundColor: colors.white, 
          borderTopColor: colors.bg3, 
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 10,
          shadowColor: colors.g1,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginTop: 4 },
        headerStyle: { backgroundColor: colors.g1, height: 110 },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '900', fontSize: 22, fontFamily: 'serif' },
      })}
    >
      <Tab.Screen name="Generate" component={GenerateScreen} options={{ title: 'LessonGen' }} />
      <Tab.Screen name="My Lessons" component={MyLessonsScreen} options={{ title: 'My Archive' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.g1 }}>
        <ActivityIndicator color={colors.gd} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.g1 },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="LessonView" component={LessonViewScreen} options={{ title: 'Lesson Note' }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Upgrade to PRO' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

// Inline PaymentScreen for mobile
function PaymentScreen({ navigation }) {
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState('monthly');

  const pay = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.paystackInit(plan);
      await Linking.openURL(res.data.authorizationUrl);
    } catch { Alert.alert('Error','Payment failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: colors.g1, marginBottom: 6 }}>Upgrade to PRO</Text>
      <Text style={{ fontSize: 13, color: colors.ink3, marginBottom: 20 }}>Unlock unlimited lesson note exports with DOCX download.</Text>
      {[['monthly','Monthly — GHS 25/month'],['annual','Annual — GHS 200/year (Save GHS 100)']].map(([val, label]) => (
        <TouchableOpacity key={val} onPress={() => setPlan(val)}
          style={{ borderWidth: 2, borderColor: plan === val ? colors.g2 : colors.bg3, borderRadius: 12, padding: 16, marginBottom: 10, backgroundColor: plan === val ? colors.g4 : colors.white }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.g1 }}>{label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={{ backgroundColor: '#0099FF', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 10 }} onPress={pay} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>💳 Pay with Paystack</Text>}
      </TouchableOpacity>
    </View>
  );
}
