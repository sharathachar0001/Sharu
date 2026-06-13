import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';

import DashboardScreen from '../screens/DashboardScreen';
import CheckInScreen from '../screens/CheckInScreen';
import VisitorListScreen from '../screens/VisitorListScreen';
import FollowUpScreen from '../screens/FollowUpScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ user, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'home' : 'home-outline',
            CheckIn: focused ? 'person-add' : 'person-add-outline',
            Visitors: focused ? 'people' : 'people-outline',
            FollowUp: focused ? 'alarm' : 'alarm-outline',
            Reports: focused ? 'bar-chart' : 'bar-chart-outline',
            Profile: focused ? 'person-circle' : 'person-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { backgroundColor: COLORS.primary, borderTopColor: COLORS.primary },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      })}
    >
      <Tab.Screen name="Dashboard">
        {props => <DashboardScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="CheckIn" options={{ title: 'Check In' }}>
        {props => <CheckInScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Visitors">
        {props => <VisitorListScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="FollowUp" options={{ title: 'Follow Up' }}>
        {props => <FollowUpScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Reports">
        {props => <ReportsScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user, onLogout }) {
  return (
    <NavigationContainer>
      <MainTabs user={user} onLogout={onLogout} />
    </NavigationContainer>
  );
}
