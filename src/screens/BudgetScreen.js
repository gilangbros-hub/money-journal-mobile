import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

function Card({ children, style }) {
    return (
        <View
            style={[{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                padding: 16,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            }, style]}
        >
            {children}
        </View>
    );
}

export default function BudgetScreen() {
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [health, setHealth] = useState(null);
    const [canEdit, setCanEdit] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [isWife, setIsWife] = useState(false);
    const [loading, setLoading] = useState(true);
    const [targetDate, setTargetDate] = useState(new Date());
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editingPocket, setEditingPocket] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchBudgets(); }, [targetDate]);

    const rp = (amount) => `Rp ${amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

    const fetchBudgets = async () => {
        setLoading(true);
        const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        try {
            const response = await api.get('/api/budget', { params: { month: monthStr } });
            if (response.data?.data) {
                const data = response.data.data;
                setBudgets(data.pockets || []);
                setSummary({
                    totalBudget: data.formattedTotal || rp(data.totalBudget),
                    totalSpent: data.formattedSpent || rp(data.totalSpent),
                    totalRemaining: data.formattedRemaining || rp(data.totalRemaining),
                });
                setHealth(data.health);
                setCanEdit(data.canEdit);
                setIsClosed(data.isClosed || false);
                setIsWife(data.canEdit || data.isClosed);
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevMonth = () => { const d = new Date(targetDate); d.setMonth(d.getMonth() - 1); setTargetDate(d); };
    const handleNextMonth = () => { const d = new Date(targetDate); d.setMonth(d.getMonth() + 1); setTargetDate(d); };

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
                budget: parseFloat(editAmount) || 0,
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

    const handleToggleMonthClose = () => {
        const action = isClosed ? 'reopen' : 'close';
        Alert.alert(
            `${isClosed ? 'Reopen' : 'Close'} This Month`,
            `Are you sure you want to ${action} the entire budget for this month? ${isClosed ? 'This will allow edits again.' : 'No one will be able to edit budgets or add transactions for this month.'}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            await api.post('/api/budget/toggle-month-close', {
                                month: targetDate.getMonth() + 1,
                                year: targetDate.getFullYear(),
                            });
                            fetchBudgets();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to toggle');
                        }
                    },
                },
            ]
        );
    };

    const monthLabel = targetDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    const getHealthLabel = () => {
        if (!health) return null;
        if (typeof health === 'string') return health;
        if (health.emoji && health.label) return `${health.emoji} ${health.label}`;
        if (health.label) return health.label;
        if (health.status) return health.status;
        return null;
    };

    const getProgressColor = (pct) => {
        if (pct >= 90) return '#EF4444';
        if (pct >= 75) return '#F59E0B';
        return '#22C55E';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A' }}>Budget Tracker</Text>
            </View>

            {/* Month Nav */}
            <View style={{ paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={handlePrevMonth} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFF9E6', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#333333', fontSize: 16, fontWeight: '600' }}>‹</Text>
                </TouchableOpacity>
                <View style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#FFF9E6' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>{monthLabel}</Text>
                </View>
                <TouchableOpacity onPress={handleNextMonth} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFF9E6', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#333333', fontSize: 16, fontWeight: '600' }}>›</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#F5A623" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 }} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {/* Summary Card */}
                    {summary && (
                        <Card style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666', marginBottom: 4 }}>Total Budget</Text>
                            <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 }}>{summary.totalBudget}</Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={{ flex: 1, backgroundColor: '#FFF9E6', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 }}>
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666', marginBottom: 2 }}>Spent</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>{summary.totalSpent}</Text>
                                </View>
                                <View style={{ flex: 1, backgroundColor: '#FFF9E6', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 }}>
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666', marginBottom: 2 }}>Remaining</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#22C55E' }}>{summary.totalRemaining}</Text>
                                </View>
                            </View>
                        </Card>
                    )}

                    {/* Month Status Card */}
                    <Card style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View style={{ flex: 1, paddingRight: 12 }}>
                                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>
                                    {isClosed ? 'Month Closed' : 'Month Status'}
                                </Text>
                                <Text style={{ fontSize: 12, fontWeight: '600', color: '#666666', lineHeight: 17 }}>
                                    {isClosed
                                        ? 'Budgets and transactions are locked.'
                                        : canEdit
                                            ? 'You can still edit this month.'
                                            : 'View-only mode. Only Wife can edit.'}
                                </Text>
                            </View>
                            {isWife && (
                                <TouchableOpacity
                                    onPress={handleToggleMonthClose}
                                    style={{
                                        paddingHorizontal: 14,
                                        paddingVertical: 7,
                                        borderRadius: 20,
                                        backgroundColor: isClosed ? '#F0FDF4' : '#FEF2F2',
                                    }}
                                >
                                    <Text style={{ fontSize: 11, fontWeight: '700', color: isClosed ? '#22C55E' : '#EF4444' }}>
                                        {isClosed ? 'Reopen' : 'Close Month'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {getHealthLabel() && (
                            <View style={{ marginTop: 12, backgroundColor: '#FFF9E6', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 }}>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666', marginBottom: 2 }}>Budget Health</Text>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>{getHealthLabel()}</Text>
                            </View>
                        )}
                    </Card>

                    {/* Section Title */}
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#1A1A1A', marginBottom: 8, marginTop: 4, paddingHorizontal: 2 }}>
                        Pocket Allocations
                    </Text>

                    {/* Pocket Cards */}
                    {budgets.length > 0 ? (
                        budgets.map((item, index) => {
                            const progress = Math.min(item.percentage || 0, 100);
                            const progressColor = getProgressColor(progress);

                            return (
                                <Card key={item.pocket || index} style={{ marginBottom: index === budgets.length - 1 ? 0 : 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <Text style={{ fontSize: 20, marginRight: 10 }}>{item.icon || '💸'}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>{item.pocket}</Text>
                                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666', marginTop: 2 }}>
                                                {item.formattedSpent || rp(item.spent)} spent
                                            </Text>
                                        </View>
                                        {canEdit && (
                                            <TouchableOpacity onPress={() => openEditModal(item)}>
                                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#F5A623' }}>Edit</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Progress */}
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666' }}>Usage</Text>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: progressColor }}>{progress}%</Text>
                                    </View>
                                    <View style={{ height: 6, borderRadius: 3, backgroundColor: '#FFF9E6', overflow: 'hidden', marginBottom: 12 }}>
                                        <View style={{ height: '100%', borderRadius: 3, width: `${progress}%`, backgroundColor: progressColor }} />
                                    </View>

                                    {/* Budget / Left */}
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <View style={{ flex: 1, backgroundColor: '#FFF9E6', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 }}>
                                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666', marginBottom: 2 }}>Budget</Text>
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>{item.formattedBudget || rp(item.budget)}</Text>
                                        </View>
                                        <View style={{ flex: 1, backgroundColor: '#FFF9E6', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 }}>
                                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666', marginBottom: 2 }}>Left</Text>
                                            <Text style={{ fontSize: 13, fontWeight: '700', color: item.isOver ? '#EF4444' : '#22C55E' }}>{item.formattedRemaining || rp(item.remaining)}</Text>
                                        </View>
                                    </View>
                                </Card>
                            );
                        })
                    ) : (
                        <Text style={{ textAlign: 'center', color: '#666666', paddingVertical: 20 }}>No budgets found.</Text>
                    )}
                </ScrollView>
            )}

            {/* Edit Modal */}
            <Modal visible={isEditModalVisible} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                    <View style={{ backgroundColor: '#FFFFFF', width: '100%', borderRadius: 20, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
                        <Text style={{ fontSize: 17, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 }}>Edit Budget</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666', marginBottom: 16 }}>
                            {editingPocket?.icon} {editingPocket?.pocket}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: '#F5A623', marginRight: 8 }}>Rp</Text>
                            <TextInput
                                style={{ flex: 1, fontSize: 20, fontWeight: '700', color: '#1A1A1A' }}
                                placeholder="0"
                                placeholderTextColor="#AAAAAA"
                                keyboardType="numeric"
                                value={editAmount}
                                onChangeText={setEditAmount}
                                autoFocus
                            />
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                style={{ flex: 1, backgroundColor: '#F5F5F0', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}
                            >
                                <Text style={{ fontWeight: '600', color: '#333333' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveBudget}
                                disabled={saving}
                                style={{ flex: 1, backgroundColor: '#F5A623', paddingVertical: 14, borderRadius: 16, alignItems: 'center' }}
                            >
                                {saving ? <ActivityIndicator color="#1A1A1A" size="small" /> : <Text style={{ fontWeight: '700', color: '#1A1A1A' }}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
