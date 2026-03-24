import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

const avatars = ['👨‍💼','👩‍💼','🧑‍💻','🦸‍♂️','🦹‍♀️','🧙‍♂️','🧛‍♂️','🧟‍♂️','🐱','🐶','🦊','🐻'];
const roles = ['Husband', 'Wife', 'Self'];

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
                if (response.data && response.data.user) {
                    setUsername(response.data.user.username);
                    setAvatar(response.data.user.avatar || '👨‍💼');
                    setRole(response.data.user.role || 'Self');
                }
            } catch (error) {
                console.error("Error fetching profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        if (!username.trim()) {
            Alert.alert("Error", "Username cannot be empty");
            return;
        }

        setSaving(true);
        try {
            await api.post('/profile', { username, avatar, role });
            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            console.error("Save error", error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

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
                            await api.post('/api/auth/logout');
                            setIsAuthenticated(false);
                        } catch (e) {
                            setIsAuthenticated(false);
                        }
                    }
                }
            ]
        );
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-bg justify-center items-center">
                <ActivityIndicator size="large" color="#7C3AED" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="px-5 py-3 border-b border-border/50 bg-bg z-10 flex-row justify-between items-center">
                    <Text className="text-[20px] font-bold text-text-primary">Edit Profile</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text className="text-coral font-bold">Logout</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} className="flex-1">
                    
                    {/* Avatar Picker */}
                    <View className="mb-6">
                        <Text className="text-[13px] font-bold uppercase tracking-wider text-text-secondary mb-3">CHOOSE AVATAR</Text>
                        <View className="flex-row flex-wrap gap-y-3 justify-between">
                            {avatars.map((a) => (
                                <TouchableOpacity 
                                    key={a}
                                    onPress={() => setAvatar(a)}
                                    className={`w-[23%] aspect-square items-center justify-center rounded-full border-2 ${avatar === a ? 'border-primary bg-primary/20 scale-110' : 'border-transparent bg-bg-secondary'}`}
                                >
                                    <Text className="text-3xl">{a}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Role Picker */}
                    <View className="mb-6">
                        <Text className="text-[13px] font-bold uppercase tracking-wider text-text-secondary mb-3">CHOOSE ROLE</Text>
                        <View className="flex-row justify-between gap-x-2">
                            {roles.map((r) => (
                                <TouchableOpacity 
                                    key={r}
                                    onPress={() => setRole(r)}
                                    className={`flex-1 py-3 items-center rounded-xl border-2 ${role === r ? 'border-primary bg-primary/20' : 'border-transparent bg-bg-secondary'}`}
                                >
                                    <Text className={`font-semibold text-base ${role === r ? 'text-primary' : 'text-text-secondary'}`}>{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Username Input */}
                    <View className="mb-8">
                        <Text className="text-[13px] font-medium text-text-secondary mb-2">Username</Text>
                        <TextInput
                            className="w-full bg-bg-tertiary text-text-primary py-4 px-5 rounded-2xl text-[15px]"
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity 
                        className="w-full bg-primary rounded-2xl h-14 items-center justify-center flex-row shadow-glow-primary"
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-white font-bold text-[15px]">Save Changes</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
