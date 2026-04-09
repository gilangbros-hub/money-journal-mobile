import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

const avatars = ['👨‍💼', '👩‍💼', '🧑‍💻', '🦸‍♂️', '🦹‍♀️', '🧙‍♂️', '🧛‍♂️', '🧟‍♂️', '🐱', '🐶', '🦊', '🐻'];
const roles = ['Husband', 'Wife', 'Self'];

function Card({ children, style }) {
    return (
        <View style={[{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 16,
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
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#F5A623" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* Header */}
                <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A' }}>Profile</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

                    {/* Current Avatar Display */}
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF9E6', borderWidth: 2, borderColor: '#F5A623', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                            <Text style={{ fontSize: 36 }}>{avatar}</Text>
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#1A1A1A' }}>{username || 'User'}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#666666', marginTop: 2 }}>{role}</Text>
                    </View>

                    {/* Avatar Card */}
                    <Card style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 }}>Choose Avatar</Text>
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
                                        backgroundColor: avatar === a ? '#FFF9E6' : '#F5F5F0',
                                        borderWidth: avatar === a ? 2 : 0,
                                        borderColor: avatar === a ? '#F5A623' : 'transparent',
                                    }}
                                >
                                    <Text style={{ fontSize: 24 }}>{a}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    {/* Role Card */}
                    <Card style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 }}>Choose Role</Text>
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
                                        backgroundColor: role === r ? '#FFF9E6' : '#F5F5F0',
                                        borderWidth: role === r ? 2 : 0,
                                        borderColor: role === r ? '#F5A623' : 'transparent',
                                    }}
                                >
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: role === r ? '#D4891A' : '#333333' }}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>

                    {/* Username Card */}
                    <Card style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 }}>Username</Text>
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
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Your username"
                            placeholderTextColor="#AAAAAA"
                        />
                    </Card>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.9}
                        style={{
                            backgroundColor: '#F5A623',
                            borderRadius: 28,
                            height: 52,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {saving ? (
                            <ActivityIndicator color="#1A1A1A" />
                        ) : (
                            <Text style={{ color: '#1A1A1A', fontWeight: '800', fontSize: 15 }}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
