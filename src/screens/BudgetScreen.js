import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/axios';

export default function BudgetScreen() {
    const [budgets, setBudgets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const today = new Date();
    const [month, setMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);

    useEffect(() => {
        fetchBudgets();
    }, [month]);

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/budget', { params: { month } });
            if (response.data && response.data.data) {
                setBudgets(response.data.data);
                if (response.data.summary) {
                    setSummary(response.data.summary);
                }
            } else if (Array.isArray(response.data)) {
                // Fallback struct
                setBudgets(response.data);
            }
        } catch (error) {
            console.error('Error fetching budgets:', error);
        } finally {
            setLoading(false);
        }
    };

    /** format currency generic func */
    const rp = (amount) => `Rp ${amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            <View className="px-5 py-3 mb-2 flex-row justify-between items-center z-10 border-b border-border/50 bg-bg">
                <Text className="text-[20px] font-bold text-text-primary">Budget Tracker</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#7C3AED" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} className="flex-1" showsVerticalScrollIndicator={false}>
                    
                    {/* Summary Card */}
                    {summary && (
                        <View className="bg-bg-secondary rounded-3xl p-6 mb-6 shadow-sm border border-border/50">
                            <Text className="text-text-muted font-medium mb-1">Total Allocated</Text>
                            <Text className="text-text-primary text-[28px] font-extrabold mb-4">{rp(summary.totalAllocated)}</Text>
                            <View className="flex-row justify-between">
                                <View>
                                    <Text className="text-text-muted text-xs mb-1">Spent</Text>
                                    <Text className="text-coral font-bold">{rp(summary.totalSpent)}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-text-muted text-xs mb-1">Remaining</Text>
                                    <Text className="text-lime font-bold">{rp(summary.totalRemaining)}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Budget Categories */}
                    <Text className="text-[17px] font-bold text-text-primary mb-4 px-1">Pocket Allocations</Text>
                    
                    {budgets.length > 0 ? (
                        <View className="flex-col gap-4">
                            {budgets.map((b, i) => {
                                const progress = Math.min(b.percentageSpent || 0, 100);
                                const isDanger = progress >= 90;
                                const isWarning = progress >= 75 && progress < 90;
                                let barColor = 'bg-primary';
                                if (isWarning) barColor = 'bg-amber';
                                if (isDanger) barColor = 'bg-coral';

                                return (
                                    <View key={b._id || b.category || i} className="bg-bg-secondary p-5 rounded-3xl border border-border/50">
                                        <View className="flex-row justify-between items-center mb-3">
                                            <View className="flex-row items-center">
                                                <Text className="text-2xl mr-3">{b.icon || '💸'}</Text>
                                                <Text className="text-text-primary font-bold text-[15px]">{b.category}</Text>
                                            </View>
                                            <TouchableOpacity>
                                                <Text className="text-text-muted text-xs underline">Edit</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-text-muted text-xs font-semibold">Spent {rp(b.spentAmount || 0)}</Text>
                                            <Text className="text-text-primary text-xs font-bold">{progress}%</Text>
                                        </View>

                                        {/* Progress Bar */}
                                        <View className="w-full h-2.5 bg-bg-tertiary rounded-full overflow-hidden mb-3">
                                            <View className={`h-full rounded-full ${barColor}`} style={{ width: `${progress}%` }} />
                                        </View>

                                        <View className="flex-row justify-between items-center bg-bg p-3 rounded-2xl">
                                            <View>
                                                <Text className="text-text-muted text-[10px] uppercase font-bold tracking-wider mb-0.5">Budget</Text>
                                                <Text className="text-text-primary font-bold">{rp(b.allocatedAmount)}</Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-text-muted text-[10px] uppercase font-bold tracking-wider mb-0.5">Left</Text>
                                                <Text className={`font-bold ${b.remainingAmount < 0 ? 'text-coral' : 'text-lime'}`}>
                                                    {rp(b.remainingAmount)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <Text className="text-center text-text-muted py-5">No budgets set this month.</Text>
                    )}

                </ScrollView>
            )}
        </SafeAreaView>
    );
}
