import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';

import DashboardScreen from '../screens/DashboardScreen';
import CheckInScreen from '../screens/CheckInScreen';
import VisitorListScreen from '../screens/VisitorListScreen';
import FollowUpScreen from '../screens/FollowUpScreen';
import ReportsScreen from '../screens/ReportsScreen';
import EODReportScreen from '../screens/EODReportScreen';
import StaffScreen from '../screens/StaffScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Dashboard: ['home',           'home-outline'],
  CheckIn:   ['person-add',     'person-add-outline'],
  Visitors:  ['people',         'people-outline'],
  FollowUp:  ['alarm',          'alarm-outline'],
  Reports:   ['bar-chart',      'bar-chart-outline'],
  EOD:       ['send',           'send-outline'],
  Staff:     ['people-circle',  'people-circle-outline'],
  Profile:   ['person-circle',  'person-circle-outline'],
};

export default function AppNavigator({ user, onLogout }) {
  const isAdmin   = user?.role === 'admin';
  const isManager = user?.role === 'manager' || isAdmin;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const [active, inactive] = ICONS[route.name] || ['ellipse', 'ellipse-outline'];
            return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.textLight,
          tabBarStyle: { backgroundColor: COLORS.primary, borderTopColor: '#2A2A4A', height: 60 },
          tabBarLabelStyle: { fontSize: 9, fontWeight: '600', marginBottom: 4 },
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700', letterSpacing: 0.5 },
        })}
      >
        {/* All roles */}
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

        {/* Manager + Admin only */}
        {isManager && (
          <Tab.Screen name="Reports">
            {props => <ReportsScreen {...props} user={user} />}
          </Tab.Screen>
        )}

        {isManager && (
          <Tab.Screen name="EOD" options={{ title: 'EOD' }}>
            {props => <EODReportScreen {...props} user={user} />}
          </Tab.Screen>
        )}

        {/* Admin only */}
        {isAdmin && (
          <Tab.Screen name="Staff">
            {props => <StaffScreen {...props} user={user} />}
          </Tab.Screen>
        )}

        <Tab.Screen name="Profile">
          {props => <ProfileScreen {...props} user={user} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
