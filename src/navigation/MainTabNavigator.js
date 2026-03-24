import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';

// Temporary Placeholders for Phase 3 & 4 screens
const AddTransactionScreen = () => <View className="flex-1 bg-bg justify-center items-center"><Text className="text-white">Add Screen</Text></View>;
const BudgetScreen = () => <View className="flex-1 bg-bg justify-center items-center"><Text className="text-white">Budget Screen</Text></View>;
const ProfileScreen = () => <View className="flex-1 bg-bg justify-center items-center"><Text className="text-white">Profile Screen</Text></View>;

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
        component={ProfileScreen} 
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}
