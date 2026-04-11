import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import BudgetScreen from '../screens/BudgetScreen';
import ProfileScreen from '../screens/ProfileScreen';
import T from '../theme';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  const visibleRoutes = state.routes.filter(r => r.name !== 'Add');

  return (
    <View style={{ position: 'relative' }}>
      <View style={styles.tabBar}>
        {visibleRoutes.map((route) => {
          const isFocused = state.index === state.routes.indexOf(route);
          const color = isFocused ? T.tabActive : T.tabInactive;

          const onPress = () => {
            if (!isFocused) navigation.navigate(route.name);
          };

          let icon = '📊';
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
              <Text style={{ fontSize: 20, marginBottom: 4 }}>{icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color }}>{route.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
    bottom: 72,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: T.accent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 8,
    shadowColor: T.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  fabText: {
    color: T.textOnAccent,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: T.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: T.tabBarBorder,
    paddingBottom: 16,
    paddingTop: 10,
    height: 64,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
