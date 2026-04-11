import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';
import T from '../theme';

function Card({ children, style }) {
    return (
        <View style={[{
            backgroundColor: T.cardBg,
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: T.cardBorder,
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
        <SafeAreaView style={{ flex: 1, backgroundColor: T.pageBg }}>
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
                        <Text style={{ fontSize: 24, fontWeight: '800', color: T.textPrimary, marginBottom: 4 }}>Money Journal</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: T.textSecondary }}>Sign in to your account</Text>
                    </View>

                    {/* Form Card */}
                    <Card>
                        <Text style={{ fontSize: 17, fontWeight: '800', color: T.textPrimary, marginBottom: 16 }}>Sign In</Text>

                        {error ? (
                            <View style={{ backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, marginBottom: 16 }}>
                                <Text style={{ color: T.danger, fontSize: 13, fontWeight: '600' }}>{error}</Text>
                            </View>
                        ) : null}

                        <View style={{ marginBottom: 14 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: T.textSecondary, marginBottom: 6 }}>Username</Text>
                            <TextInput
                                style={{
                                    backgroundColor: T.inputBg,
                                    borderRadius: 14,
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: T.textPrimary,
                                    borderWidth: 1,
                                    borderColor: T.inputBorder,
                                }}
                                placeholder="your_username"
                                placeholderTextColor={T.textMuted}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: T.textSecondary, marginBottom: 6 }}>Password</Text>
                            <TextInput
                                style={{
                                    backgroundColor: T.inputBg,
                                    borderRadius: 14,
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: T.textPrimary,
                                    borderWidth: 1,
                                    borderColor: T.inputBorder,
                                }}
                                placeholder="••••••••"
                                placeholderTextColor={T.textMuted}
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
                                backgroundColor: T.accent,
                                borderRadius: 28,
                                height: 52,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator color={T.textOnAccent} />
                            ) : (
                                <Text style={{ color: T.textOnAccent, fontWeight: '800', fontSize: 15 }}>Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
