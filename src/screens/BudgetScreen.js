import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

export default function BudgetScreen() {
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [health, setHealth] = useState(null);
    const [canEdit, setCanEdit] = useState(false);
    const [loading, setLoading] = useState(true);

    const [targetDate, setTargetDate] = useState(new Date());

    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingPocket, setEditingPocket] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchBudgets();
    }, [targetDate]);

    const fetchBudgets = async () => {
        setLoading(true);
        const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        try {
            const response = await api.get('/api/budget', { params: { month: monthStr } });
            if (response.data && response.data.data) {
                const data = response.data.data;
                setBudgets(data.pockets || []);
                setSummary({
                    totalBudget: data.formattedTotal || rp(data.totalBudget),
                    totalSpent: data.formattedSpent || rp(data.totalSpent),
                    totalRemaining: data.formattedRemaining || rp(data.totalRemaining)
                });
                setHealth(data.health);
                setCanEdit(data.canEdit);
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => {
        const newDate = new Date(targetDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setTargetDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(targetDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setTargetDate(newDate);
    };

    const rp = (amount) => `Rp ${amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

    const openEditModal = (pocketData) => {
        if (!canEdit) return;
        setEditingPocket(pocketData);
        setEditAmount(pocketData.budget ? pocketData.budget.toString() : '');
        setEditModalVisible(true);
    };

    const handleSaveBudget = async () => {
        if (!editingPocket) return;
        setSaving(true);
        try {
            const payload = {
                pocket: editingPocket.pocket,
                month: targetDate.getMonth() + 1,
                year: targetDate.getFullYear(),
                budget: parseFloat(editAmount) || 0
            };
            await api.post('/api/budget', payload);
            setEditModalVisible(false);
            fetchBudgets();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save budget');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleClose = async (budgetId, currentlyClosed) => {
        const action = currentlyClosed ? 'reopen' : 'close';
        Alert.alert(
            `${currentlyClosed ? 'Reopen' : 'Close'} Budget`,
            `Are you sure you want to ${action} this budget pocket?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: async () => {
                    try {
                        await api.patch(`/api/budget/${budgetId}/toggle-close`);
                        fetchBudgets();
                    } catch (error) {
                        Alert.alert('Error', error.response?.data?.message || 'Failed to toggle');
                    }
                }}
            ]
        );
    };

    const monthLabel = targetDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            <View className="px-5 py-3 mb-2 flex-row justify-between items-center z-10 border-b border-border/50 bg-bg">
                <Text className="text-[20px] font-bold text-text-primary">Budget Tracker</Text>
            </View>

            {/* Month Navigation */}
            <View className="px-5 py-3 flex-row items-center justify-between">
                <TouchableOpacity onPress={handlePrevMonth} className="w-10 h-10 bg-bg-secondary rounded-xl items-center justify-center border border-border/50">
                    <Text className="text-text-secondary text-lg font-bold">←</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-text-primary">{monthLabel}</Text>
                <TouchableOpacity onPress={handleNextMonth} className="w-10 h-10 bg-bg-secondary rounded-xl items-center justify-center border border-border/50">
                    <Text className="text-text-secondary text-lg font-bold">→</Text>
                </TouchableOpacity>
            </View>

            {!canEdit && (
                <View className="px-5 mb-2">
                    <View className="bg-amber/20 px-4 py-3 rounded-xl flex-row items-center border border-amber/30">
                        <Text className="mr-2">👁️</Text>
                        <Text className="text-amber text-sm font-medium">View-only mode. Only Wife can edit.</Text>
                    </View>
                </View>
            )}

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#7C3AED" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} className="flex-1" showsVerticalScrollIndicator={false}>
                    
                    {/* Summary Card */}
                    {summary && (
                        <View className="bg-bg-secondary rounded-3xl p-6 mb-6 mt-4 shadow-sm border border-border/50 items-center">
                            <Text className="text-text-muted font-medium mb-1">Total Budget</Text>
                            <Text className="text-text-primary text-[28px] font-extrabold mb-4">{summary.totalBudget}</Text>
                            <View className="flex-row justify-between w-full px-4">
                                <View className="items-center">
                                    <Text className="text-text-muted text-xs mb-1">Spent</Text>
                                    <Text className="text-coral font-bold">{summary.totalSpent}</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-text-muted text-xs mb-1">Remaining</Text>
                                    <Text className="text-lime font-bold">{summary.totalRemaining}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Budget Categories */}
                    <View className="flex-row justify-between items-center px-1 mb-4">
                        <Text className="text-[17px] font-bold text-text-primary">Pocket Allocations</Text>
                    </View>
                    
                    {budgets.length > 0 ? (
                        <View className="flex-col gap-4">
                            {budgets.map((b, i) => {
                                const progress = Math.min(b.percentage || 0, 100);
                                const isDanger = progress >= 90;
                                const isWarning = progress >= 75 && progress < 90;
                                let barColor = 'bg-primary';
                                if (isWarning) barColor = 'bg-amber';
                                if (isDanger) barColor = 'bg-coral';

                                return (
                                    <View key={b.pocket || i} className="bg-bg-secondary p-5 rounded-3xl border border-border/50">
                                        <View className="flex-row justify-between items-center mb-3">
                                            <View className="flex-row items-center">
                                                <Text className="text-2xl mr-3">{b.icon || '💸'}</Text>
                                                <Text className="text-text-primary font-bold text-[15px]">{b.pocket}</Text>
                                                {b.closed && (
                                                    <View style={{ backgroundColor: 'rgba(255,77,109,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 8 }}>
                                                        <Text style={{ color: '#FF4D6D', fontSize: 10, fontWeight: '700' }}>🔒 Closed</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View className="flex-row items-center">
                                                {canEdit && b._id && (
                                                    <TouchableOpacity 
                                                        onPress={() => handleToggleClose(b._id, b.closed)}
                                                        style={{ marginRight: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: b.closed ? 'rgba(34,197,94,0.3)' : 'rgba(255,77,109,0.3)' }}
                                                    >
                                                        <Text style={{ color: b.closed ? '#22C55E' : '#FF4D6D', fontSize: 10, fontWeight: '700' }}>{b.closed ? '🔓 Open' : '🔒 Close'}</Text>
                                                    </TouchableOpacity>
                                                )}
                                                {canEdit && !b.closed && (
                                                    <TouchableOpacity onPress={() => openEditModal(b)}>
                                                        <Text className="text-primary text-xs font-bold underline">Edit</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>

                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-text-muted text-xs font-semibold">Spent {b.formattedSpent || rp(b.spent)}</Text>
                                            <Text className="text-text-primary text-xs font-bold">{progress}%</Text>
                                        </View>

                                        {/* Progress Bar */}
                                        <View className="w-full h-2.5 bg-bg-tertiary rounded-full overflow-hidden mb-3">
                                            <View className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
                                        </View>

                                        <View className="flex-row justify-between items-center bg-bg p-3 rounded-2xl">
                                            <View>
                                                <Text className="text-text-muted text-[10px] uppercase font-bold tracking-wider mb-0.5">Budget</Text>
                                                <Text className="text-text-primary font-bold">{b.formattedBudget || rp(b.budget)}</Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-text-muted text-[10px] uppercase font-bold tracking-wider mb-0.5">Left</Text>
                                                <Text className={`font-bold ${b.isOver ? 'text-coral' : 'text-lime'}`}>
                                                    {b.formattedRemaining || rp(b.remaining)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <Text className="text-center text-text-muted py-5">No budgets found.</Text>
                    )}

                </ScrollView>
            )}

            {/* Edit Modal */}
            <Modal visible={isEditModalVisible} transparent={true} animationType="fade">
                <View className="flex-1 bg-black/60 justify-center items-center px-5">
                    <View className="bg-bg w-full rounded-3xl p-6 border border-border/50 shadow-lg">
                        <Text className="text-xl font-bold text-text-primary mb-2">Edit Budget</Text>
                        <Text className="text-lg font-semibold mb-5 text-text-secondary">{editingPocket?.icon} {editingPocket?.pocket}</Text>
                        
                        <View className="flex-row items-center bg-bg-secondary rounded-2xl p-4 mb-6 border border-border/50">
                            <Text className="text-xl font-bold text-text-primary mr-2">Rp</Text>
                            <TextInput
                                className="flex-1 text-2xl font-bold text-text-primary"
                                placeholder="0"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={editAmount}
                                onChangeText={setEditAmount}
                                autoFocus
                            />
                        </View>

                        <View className="flex-row justify-between">
                            <TouchableOpacity 
                                className="flex-1 bg-bg-secondary py-4 rounded-2xl items-center mr-3 border border-border/50"
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text className="text-text-primary font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                className="flex-1 bg-primary py-4 rounded-2xl items-center"
                                onPress={handleSaveBudget}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text className="text-white font-bold">Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
