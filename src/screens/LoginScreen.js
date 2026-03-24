import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

export default function LoginScreen({ navigation, setIsAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // The API returns a 302 redirect on successful login normally for Web,
            // but Axios will follow it. If we hit the dashboard or get a 200, we're good.
            const response = await api.post('/auth/login', {
                username,
                password
            });
            
            // Assume success if no error was thrown
            // In a better setup, the API would return JSON instead of a 302 redirect
            setIsAuthenticated(true);
        } catch (err) {
            console.error('Login error:', err);
            // If the backend returns a 400/401 with a message
            if (err.response && err.response.data && err.response.data.message) {
                 setError(err.response.data.message);
            } else if (err.response && err.response.status === 400) {
                 setError('Invalid username or password');
            } else {
                 setError('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-bg">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}} className="px-6 py-8">
                    
                    <View className="items-center mb-10">
                        <View className="w-16 h-16 rounded-2xl bg-bg-secondary border border-border/50 items-center justify-center mb-6 shadow-sm">
                            <Text className="text-3xl">CB</Text>
                        </View>
                        <Text className="text-[26px] font-bold text-text-primary mb-2">Welcome Back</Text>
                        <Text className="text-[15px] text-text-secondary">Sign in to your account</Text>
                    </View>

                    <View className="bg-bg-secondary border border-border/50 rounded-3xl p-6 shadow-sm">
                        <Text className="text-xl font-bold text-text-primary mb-6">Sign In</Text>

                        {error ? (
                            <View className="bg-coral/10 p-3 rounded-xl mb-5 border border-coral/20">
                                <Text className="text-coral text-sm font-medium">{error}</Text>
                            </View>
                        ) : null}

                        <View className="mb-5">
                            <Text className="text-sm font-medium text-text-secondary mb-2">Username</Text>
                            <TextInput
                                className="w-full bg-bg-tertiary text-text-primary py-4 px-4 rounded-2xl text-[15px]"
                                placeholder="your_username"
                                placeholderTextColor="#94A3B8"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm font-medium text-text-secondary mb-2">Password</Text>
                            <TextInput
                                className="w-full bg-bg-tertiary text-text-primary py-4 px-4 rounded-2xl text-[15px]"
                                placeholder="••••••••"
                                placeholderTextColor="#94A3B8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity 
                            className="w-full bg-primary rounded-2xl h-14 items-center justify-center flex-row"
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text className="text-white font-bold text-[15px]">Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
