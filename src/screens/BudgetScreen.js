import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

const cardStyles = {
    blue: {
        backgroundColor: '#1256C8',
        borderColor: 'rgba(90, 166, 255, 0.28)',
        shadowColor: '#1677FF',
    },
    purple: {
        backgroundColor: '#4C1D95',
        borderColor: 'rgba(167, 139, 250, 0.25)',
        shadowColor: '#7C3AED',
    },
    coral: {
        backgroundColor: '#7F1D1D',
        borderColor: 'rgba(255, 77, 109, 0.24)',
        shadowColor: '#FF4D6D',
    },
    slate: {
        backgroundColor: '#1E293B',
        borderColor: 'rgba(148, 163, 184, 0.14)',
        shadowColor: '#0F172A',
    },
};

function ColorCard({ variant = 'slate', children, className = '' }) {
    const palette = cardStyles[variant];
    return (
        <View
            className={`rounded-[30px] border ${className}`}
            style={{
                backgroundColor: palette.backgroundColor,
                borderColor: palette.borderColor,
                shadowColor: palette.shadowColor,
                shadowOpacity: 0.12,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 8 },
                elevation: 4,
            }}
        >
            {children}
        </View>
    );
}

function BudgetMetric({ label, value, isLast = false }) {
    return (
        <View className={`flex-1 rounded-[20px] px-4 py-4 bg-white/10 ${isLast ? '' : 'mr-3'}`}>
            <Text className="text-white/70 text-[11px] font-semibold mb-1">{label}</Text>
            <Text className="text-white font-bold text-[13px]" numberOfLines={1}>
                {value}
            </Text>
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

    useEffect(() => {
        fetchBudgets();
    }, [targetDate]);

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
    const strongestBudget = budgets.reduce((current, item) => {
        if (!current) return item;
        return (item.percentage || 0) > (current.percentage || 0) ? item : current;
    }, null);

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            <View className="px-5 py-2">
                <Text className="text-[24px] font-bold text-text-primary">Budget Tracker</Text>
                <Text className="text-[13px] text-text-muted mt-1">Compact cards for every pocket and state.</Text>
            </View>

            <View className="px-5 py-2 flex-row items-center justify-between">
                <TouchableOpacity onPress={handlePrevMonth} className="w-11 h-11 bg-bg-secondary rounded-2xl items-center justify-center border border-border/50">
                    <Text className="text-text-secondary text-lg font-bold">‹</Text>
                </TouchableOpacity>
                <View className="px-4 py-2 rounded-full bg-bg-secondary border border-border/40">
                    <Text className="text-[14px] font-bold text-text-primary">{monthLabel}</Text>
                </View>
                <TouchableOpacity onPress={handleNextMonth} className="w-11 h-11 bg-bg-secondary rounded-2xl items-center justify-center border border-border/50">
                    <Text className="text-text-secondary text-lg font-bold">›</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#7C3AED" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 }} className="flex-1" showsVerticalScrollIndicator={false}>
                    {summary && (
                        <ColorCard variant="blue" className="p-5 mb-5">
                            <Text className="text-white/75 text-[12px] font-semibold mb-2">Total Budget</Text>
                            <Text className="text-white text-[32px] font-extrabold tracking-tight mb-4">{summary.totalBudget}</Text>

                            <View className="flex-row">
                                <BudgetMetric label="Spent" value={summary.totalSpent} />
                                <BudgetMetric label="Remaining" value={summary.totalRemaining} isLast />
                            </View>
                        </ColorCard>
                    )}

                    <ColorCard variant={isClosed ? 'coral' : 'purple'} className="p-5 mb-5">
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1 pr-3">
                                <Text className="text-white text-[17px] font-bold mb-1">
                                    {isClosed ? 'Month Closed' : 'Month Status'}
                                </Text>
                                <Text className="text-white/70 text-[12px]">
                                    {isClosed
                                        ? 'Budgets and transactions are locked for this month.'
                                        : canEdit
                                            ? 'You can still edit this month budget.'
                                            : 'View-only mode. Only Wife can edit.'}
                                </Text>
                            </View>
                            {isWife ? (
                                <TouchableOpacity
                                    onPress={handleToggleMonthClose}
                                    className="rounded-full px-4 py-2 border"
                                    style={{ borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.1)' }}
                                >
                                    <Text className="text-white text-[11px] font-bold">
                                        {isClosed ? 'Reopen' : 'Close Month'}
                                    </Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        {health ? (
                            <View className="mt-4 rounded-[22px] px-4 py-4 bg-white/10">
                                <Text className="text-white/70 text-[11px] font-semibold mb-1">Budget Health</Text>
                                <Text className="text-white font-bold text-[13px]">
                                    {typeof health === 'string' ? health : JSON.stringify(health)}
                                </Text>
                            </View>
                        ) : null}
                    </ColorCard>

                    <View className="flex-row justify-between items-end mb-4 px-1">
                        <View>
                            <Text className="text-[17px] font-bold text-text-primary">Pocket Allocations</Text>
                            <Text className="text-[12px] text-text-muted mt-1">
                                {strongestBudget ? `${strongestBudget.pocket} is the hottest pocket right now.` : 'No pocket budget yet.'}
                            </Text>
                        </View>
                    </View>

                    {budgets.length > 0 ? (
                        budgets.map((budgetItem, index) => {
                            const progress = Math.min(budgetItem.percentage || 0, 100);
                            const isDanger = progress >= 90;
                            const isWarning = progress >= 75 && progress < 90;
                            const variant = isDanger ? 'coral' : isWarning ? 'purple' : 'slate';
                            const progressColor = isDanger ? '#FF4D6D' : isWarning ? '#F59E0B' : '#22C55E';

                            return (
                                <ColorCard
                                    key={budgetItem.pocket || index}
                                    variant={variant}
                                    className={`p-5 ${index === budgets.length - 1 ? 'mb-0' : 'mb-4'}`}
                                >
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="flex-row items-center flex-1 pr-3">
                                            <View
                                                className="w-12 h-12 rounded-[18px] items-center justify-center mr-3"
                                                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                                            >
                                                <Text className="text-[22px]">{budgetItem.icon || '💸'}</Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-white font-bold text-[15px] mb-1">{budgetItem.pocket}</Text>
                                                <Text className="text-white/70 text-[11px] font-medium">
                                                    {budgetItem.formattedSpent || rp(budgetItem.spent)} spent
                                                </Text>
                                            </View>
                                        </View>

                                        {canEdit ? (
                                            <TouchableOpacity
                                                onPress={() => openEditModal(budgetItem)}
                                                className="rounded-full px-3 py-2 border"
                                                style={{ borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.1)' }}
                                            >
                                                <Text className="text-white text-[11px] font-bold">Edit</Text>
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>

                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-white/70 text-[11px] font-semibold">Usage</Text>
                                        <Text className="text-white text-[12px] font-bold">{progress}%</Text>
                                    </View>

                                    <View className="w-full h-2.5 rounded-full overflow-hidden mb-4 bg-white/10">
                                        <View className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: progressColor }} />
                                    </View>

                                    <View className="flex-row">
                                        <View className="flex-1 rounded-[20px] px-4 py-4 mr-3 bg-white/10">
                                            <Text className="text-white/70 text-[11px] font-semibold mb-1">Budget</Text>
                                            <Text className="text-white font-bold text-[13px]">{budgetItem.formattedBudget || rp(budgetItem.budget)}</Text>
                                        </View>
                                        <View className="flex-1 rounded-[20px] px-4 py-4 bg-white/10">
                                            <Text className="text-white/70 text-[11px] font-semibold mb-1">Left</Text>
                                            <Text className="text-white font-bold text-[13px]">{budgetItem.formattedRemaining || rp(budgetItem.remaining)}</Text>
                                        </View>
                                    </View>
                                </ColorCard>
                            );
                        })
                    ) : (
                        <Text className="text-center text-text-muted py-5">No budgets found.</Text>
                    )}
                </ScrollView>
            )}

            <Modal visible={isEditModalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/60 justify-center items-center px-5">
                    <View className="bg-bg w-full rounded-[30px] p-6 border border-border/50 shadow-lg">
                        <Text className="text-xl font-bold text-text-primary mb-2">Edit Budget</Text>
                        <Text className="text-[15px] font-semibold mb-5 text-text-secondary">
                            {editingPocket?.icon} {editingPocket?.pocket}
                        </Text>

                        <View className="flex-row items-center bg-bg-secondary rounded-[22px] p-4 mb-6 border border-border/50">
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
                                className="flex-1 bg-bg-secondary py-4 rounded-[20px] items-center mr-3 border border-border/50"
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text className="text-text-primary font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-primary py-4 rounded-[20px] items-center"
                                onPress={handleSaveBudget}
                                disabled={saving}
                            >
                                {saving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text className="text-white font-bold">Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
