import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import BudgetScreen from '../screens/BudgetScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ setIsAuthenticated }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { 
            backgroundColor: '#1E293B', 
            borderTopColor: '#334155', 
            paddingBottom: 8, 
            paddingTop: 8,
            height: 65,
            borderTopWidth: 1
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 4 }
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text> }}
      >
        {(props) => <DashboardScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Add" 
        component={AddTransactionScreen} 
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text> }}
      />
      <Tab.Screen 
        name="Budget" 
        component={BudgetScreen} 
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💰</Text> }}
      />
      <Tab.Screen 
        name="Profile" 
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }}
      >
        {(props) => <ProfileScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
