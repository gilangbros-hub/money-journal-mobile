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
    <View style={styles.tabBarContainer}>
      {/* Floating + Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Add')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

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
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 22, color, marginBottom: 6 }}>{icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color }}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  tabBarContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    top: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
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
    borderTopColor: '#334155',
    borderTopWidth: 1,
    paddingBottom: 16,
    paddingTop: 12,
    height: 80,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
