import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

function Card({ children, style }) {
    return (
        <View style={[{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 20,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
        }, style]}>
            {children}
        </View>
    );
}

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
            await api.post('/api/auth/login', { username, password });
            setIsAuthenticated(true);
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.status === 400) {
                setError('Invalid username or password');
            } else {
                setError('Network error. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}>
                    {/* Logo */}
                    <View style={{ alignItems: 'center', marginBottom: 32 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' }}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                            />
                        </View>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 }}>Money Journal</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666' }}>Sign in to your account</Text>
                    </View>

                    {/* Form Card */}
                    <Card>
                        <Text style={{ fontSize: 17, fontWeight: '800', color: '#1A1A1A', marginBottom: 16 }}>Sign In</Text>

                        {error ? (
                            <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, marginBottom: 16 }}>
                                <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666', marginBottom: 6 }}>Username</Text>
                            <TextInput
                                style={{
                                    backgroundColor: '#F5F5F0',
                                    borderRadius: 14,
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: '#1A1A1A',
                                }}
                                placeholder="your_username"
                                placeholderTextColor="#AAAAAA"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666', marginBottom: 6 }}>Password</Text>
                            <TextInput
                                style={{
                                    backgroundColor: '#F5F5F0',
                                    borderRadius: 14,
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: '#1A1A1A',
                                }}
                                placeholder="••••••••"
                                placeholderTextColor="#AAAAAA"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.9}
                            style={{
                                backgroundColor: '#F5A623',
                                borderRadius: 28,
                                height: 52,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator color="#1A1A1A" />
                            ) : (
                                <Text style={{ color: '#1A1A1A', fontWeight: '800', fontSize: 15 }}>Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
