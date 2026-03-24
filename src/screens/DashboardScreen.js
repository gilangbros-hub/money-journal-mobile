import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

export default function DashboardScreen({ setIsAuthenticated }) {
    
    const handleLogout = async () => {
        try {
            await api.get('/logout'); // Assumes standard GET route for logout config
            setIsAuthenticated(false);
        } catch (e) {
            console.error('Logout error', e);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-bg p-6 justify-center items-center">
            <Text className="text-2xl font-bold text-text-primary mb-4">Dashboard Coming Soon</Text>
            <Text className="text-text-secondary text-center mb-8">
                You are successfully logged in and the session cookie is saved natively!
            </Text>
            <TouchableOpacity 
                className="bg-coral px-6 py-3 rounded-xl"
                onPress={handleLogout}
            >
                <Text className="text-white font-bold">Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
