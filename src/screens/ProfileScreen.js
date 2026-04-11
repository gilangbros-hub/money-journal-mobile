import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';
import T from '../theme';

const avatars = ['👨‍💼', '👩‍💼', '🧑‍💻', '🦸‍♂️', '🦹‍♀️', '🧙‍♂️', '🧛‍♂️', '🧟‍♂️', '🐱', '🐶', '🦊', '🐻'];
const roles = ['Husband', 'Wife', 'Self'];

function Card({ children, style }) {
    return (
        <View style={[{
            backgroundColor: T.cardBg,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: T.cardBorder,
        }, style]}>
            {children}
        </View>
    );
}

export default function ProfileScreen({ setIsAuthenticated }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('👨‍💼');
    const [role, setRole] = useState('Self');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/api/auth/me');
                if (response.data?.user) {
                    setUsername(response.data.user.username);
                    setAvatar(response.data.user.avatar || '👨‍💼');
                    setRole(response.data.user.role || 'Self');
                }
            } catch (error) {
                console.error('Error fetching profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }
        setSaving(true);
        try {
            await api.post('/profile', { username, avatar, role });
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    try { await api.post('/api/auth/logout'); } catch (e) { /* ignore */ }
                    setIsAuthenticated(false);
                },
            },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: T.pageBg, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={T.accent} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: T.pageBg }} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* Header */}
                <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: T.textPrimary }}>Profile</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: T.danger }}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

                    {/* Current Avatar Display */}
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: T.accentSoft, borderWidth: 2, borderColor: T.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                            <Text style={{ fontSize: 36 }}>{avatar}</Text>
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: T.textPrimary }}>{username || 'User'}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: T.textSecondary, marginTop: 2 }}>{role}</Text>
                    </View>

                    {/* Avatar Card */}
                    <Card style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: T.textPrimary, marginBottom: 12 }}>Choose Avatar</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {avatars.map((a) => (
                                <TouchableOpacity
                                    key={a}
                                    onPress={() => setAvatar(a)}
                                    activeOpacity={0.7}
                                    style={{
                                        width: '22%',
                                        aspectRatio: 1,
                                        borderRadius: 16,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: avatar === a ? T.accentSoft : T.inputBg,
                                        borderWidth: avatar === a ? 2 : 0,
                                        borderColor: avatar === a ? T.accent : 'transparent',
                                    }}
                                >
                                    <Text style={{ fontSize: 24 }}>{a}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    {/* Role Card */}
                    <Card style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: T.textPrimary, marginBottom: 12 }}>Choose Role</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {roles.map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    onPress={() => setRole(r)}
                                    activeOpacity={0.7}
                                    style={{
                                        flex: 1,
                                        paddingVertical: 12,
                                        borderRadius: 14,
                                        alignItems: 'center',
                                        backgroundColor: role === r ? T.accentSoft : T.inputBg,
                                        borderWidth: role === r ? 2 : 0,
                                        borderColor: role === r ? T.accent : 'transparent',
                                    }}
                                >
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: role === r ? T.accent : T.textSecondary }}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    {/* Username Card */}
                    <Card style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: T.textPrimary, marginBottom: 10 }}>Username</Text>
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
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Your username"
                            placeholderTextColor={T.textMuted}
                        />
                    </Card>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.9}
                        style={{
                            backgroundColor: T.accent,
                            borderRadius: 28,
                            height: 52,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {saving ? (
                            <ActivityIndicator color={T.textOnAccent} />
                        ) : (
                            <Text style={{ color: T.textOnAccent, fontWeight: '800', fontSize: 15 }}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
