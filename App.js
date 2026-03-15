import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { UserAuthContextProvider } from './src/context/UserAuthContext';

import HomeScreen from './src/screens/HomeScreen';
import VoteScreen from './src/screens/VoteScreen';
import VoteDetail from './src/screens/VoteDetail';
import CardScreen from './src/screens/CardScreen';
import CameraScreen from './src/screens/CameraScreen';
import ChallengeScreen from './src/screens/ChallengeScreen';
import SettingScreen from './src/screens/SettingScreen';
import SecurityScreen from './src/screens/SecurityScreen'; // ปรับ Path ให้เข้าพวก
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import VoteHistory from './src/screens/VoteHistory';
import EditProfileScreen from './src/screens/EditProfileScreen';
import MemberScreen from './src/screens/MemberScreen';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack สำหรับหน้า Home
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Vote" component={VoteScreen} />
      <Stack.Screen name="VoteDetail" component={VoteDetail} />
    </Stack.Navigator>
  );
}

// แถบเมนูด้านล่าง (Tabs)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#0766f7',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
        tabBarStyle: { height: 64, backgroundColor: '#fff', borderTopWidth: 0.5, borderColor: '#eee', elevation: 0, paddingBottom: Platform.OS === 'android' ? 8 : 12 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size}) => (
            <View style={{ alignItems: 'center' }}>
                <MaterialIcons name="home" size={20} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Card"
        component={CardScreen}
        options={{
          tabBarIcon: ({ color, size}) => (
            <View style={{ alignItems: 'center' }}>
              <MaterialIcons name="credit-card" size={24}  />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarButton: (props) => {
            return (
              <TouchableOpacity
                onPress={props.onPress}
                style={{ top: -28, justifyContent: 'center', alignItems: 'center' }}
              >
                <View style={styles.fab}>
                  <MaterialIcons name="photo-camera" size={28} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          },
        }}
      />
      <Tab.Screen
        name="Challenge"
        component={ChallengeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center' }}>
                <MaterialIcons name="emoji-events" size={24} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Setting"
        component={SettingScreen}
        options={{
          tabBarIcon: ({ color, size}) => (
            <View style={{ alignItems: 'center' }}>
                <MaterialIcons name="settings" size={24} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// จุดเริ่มต้นของแอป
export default function App() {
  return (
    <UserAuthContextProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Security" component={SecurityScreen} />
          <Stack.Screen name="VoteHistory" component={VoteHistory} />
          <Stack.Screen name="VoteScreen" component={VoteScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} // ซ่อน Header พื้นฐานของ Stack
          />
          <Stack.Screen name="Member" component={MemberScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </UserAuthContextProvider>
  );
}

const styles = StyleSheet.create({
  fabContainer: { top: -20, 
    justifyContent: 'center', 
    alignItems: 'center' },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0766f7',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  centerLabel: { marginTop: 6, fontSize: 11 },
});
