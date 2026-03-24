import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AllTransactionsScreen from './src/screens/AllTransactionsScreen';

// We intercept networking config
import api from './src/api/axios';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if session cookie exists by trying to hit dashboard endpoint
    const checkSession = async () => {
      try {
        const response = await api.get('/api/dashboard/summary', { params: { month: '2026-02' } });
        if (response.data && response.data.success) {
            setIsAuthenticated(true);
        }
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return null; // A proper splash screen can replace this
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#0F172A" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
        ) : (
          <Stack.Group>
            <Stack.Screen name="MainTabs">
               {(props) => <MainTabNavigator {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
            <Stack.Screen name="AllTransactions" component={AllTransactionsScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
