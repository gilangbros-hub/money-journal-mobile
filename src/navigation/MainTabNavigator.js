import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import BudgetScreen from '../screens/BudgetScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Custom tab bar with FAB
function CustomTabBar({ state, descriptors, navigation }) {
  // Filter out the hidden "Add" tab from rendering
  const visibleRoutes = state.routes.filter(r => r.name !== 'Add');

  return (
    <View style={{ position: 'relative' }}>
      {/* Tab items */}
      <View style={styles.tabBar}>
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.indexOf(route);
          const color = isFocused ? '#7C3AED' : '#94A3B8';

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(route.name);
            }
          };

          let icon = '📊';
          let label = route.name;
          if (route.name === 'Dashboard') icon = '📊';
          if (route.name === 'Budget') icon = '💰';
          if (route.name === 'Profile') icon = '👤';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.tabItemActive]}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 22, color, marginBottom: 6 }}>{icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color }}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating + Button — truly floating, bottom-right, hidden on Add screen */}
      {state.routes[state.index]?.name !== 'Add' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Add')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MainTabNavigator({ setIsAuthenticated }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard">
        {(props) => <DashboardScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
      </Tab.Screen>
      <Tab.Screen 
        name="Add" 
        component={AddTransactionScreen}
        options={{ tabBarButton: () => null }} 
      />
      <Tab.Screen 
        name="Budget" 
        component={BudgetScreen} 
      />
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 102,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 14,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderColor: 'rgba(148, 163, 184, 0.12)',
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 18,
    paddingBottom: 10,
    paddingTop: 10,
    height: 72,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 28,
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    borderRadius: 22,
    height: 52,
  },
  tabItemActive: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
});
