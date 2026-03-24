import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

export default function ProfileScreen({ setIsAuthenticated }) {

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Sign Out", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.get('/auth/logout');
                            setIsAuthenticated(false);
                        } catch (e) {
                            // even if fails, force it locally
                            setIsAuthenticated(false);
                        }
                    }
                }
            ]
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            <View className="px-5 py-3 border-b border-border/50 bg-bg z-10">
                <Text className="text-[20px] font-bold text-text-primary">Profile</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} className="flex-1">
                
                {/* User Info Card */}
                <View className="bg-bg-secondary p-6 rounded-3xl border border-border/50 items-center mb-6 shadow-sm">
                    <View className="w-24 h-24 bg-primary/20 rounded-full items-center justify-center border-4 border-primary/50 relative mb-4">
                        <Text className="text-5xl">👨‍💼</Text>
                    </View>
                    <Text className="text-[20px] font-bold text-text-primary mb-1">Gilang / Revo</Text>
                    <Text className="text-text-secondary text-[14px]">Admin User</Text>
                </View>

                {/* Settings Menu */}
                <View className="bg-bg-secondary rounded-3xl border border-border/50 overflow-hidden mb-8">
                    <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-border/50">
                        <View className="flex-row items-center">
                            <Text className="text-xl mr-3">🎨</Text>
                            <Text className="text-text-primary font-semibold text-[15px]">Appearance</Text>
                        </View>
                        <Text className="text-text-muted">→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-border/50">
                        <View className="flex-row items-center">
                            <Text className="text-xl mr-3">⚙️</Text>
                            <Text className="text-text-primary font-semibold text-[15px]">Account Settings</Text>
                        </View>
                        <Text className="text-text-muted">→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between p-5">
                        <View className="flex-row items-center">
                            <Text className="text-xl mr-3">📱</Text>
                            <Text className="text-text-primary font-semibold text-[15px]">About App v2.0</Text>
                        </View>
                        <Text className="text-text-muted">→</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity 
                    onPress={handleLogout}
                    className="w-full bg-coral/10 border border-coral/30 rounded-2xl h-14 items-center justify-center flex-row shadow-sm"
                >
                    <Text className="text-coral font-bold text-[15px]">Sign Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
