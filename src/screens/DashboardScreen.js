import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';
import api from '../api/axios';

const chartColors = ['#FF4D6D', '#7C3AED', '#22C55E', '#F59E0B', '#06B6D4', '#F97316', '#3B82F6', '#EC4899', '#FBBF24', '#14B8A6'];
const typeEmojis = {
    Eat: '🍽️',
    Snack: '🍿',
    Groceries: '🛒',
    Laundry: '🧺',
    Bensin: '⛽',
    Flazz: '💳',
    'Home Appliance': '🏠',
    'Jumat Berkah': '🤲',
    'Uang Sampah': '🗑️',
    'Uang Keamanan': '👮',
    Medicine: '💊',
    Others: '📦',
};

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
    emerald: {
        backgroundColor: '#14532D',
        borderColor: 'rgba(74, 222, 128, 0.18)',
        shadowColor: '#22C55E',
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

function StatMiniCard({ label, value, tone, isLast = false }) {
    const tones = {
        coral: { bg: 'rgba(255,255,255,0.14)', text: '#FFE4EA' },
        lime: { bg: 'rgba(255,255,255,0.14)', text: '#DCFCE7' },
        blue: { bg: 'rgba(255,255,255,0.14)', text: '#DBEAFE' },
    };
    const currentTone = tones[tone] || tones.blue;

    return (
        <View
            className={`flex-1 rounded-[22px] px-4 py-4 ${isLast ? '' : 'mr-3'}`}
            style={{ backgroundColor: currentTone.bg }}
        >
            <Text className="text-white/70 text-[11px] font-semibold mb-1">{label}</Text>
            <Text className="text-[13px] font-bold" style={{ color: currentTone.text }} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

export default function DashboardScreen({ setIsAuthenticated, navigation }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [avatar, setAvatar] = useState('👤');
    const [targetDate, setTargetDate] = useState(new Date());

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [targetDate]);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/api/auth/me');
            if (response.data?.user) {
                setAvatar(response.data.user.avatar || '👤');
            }
        } catch (error) {
            // ignore silently
        }
    };

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
            const response = await api.get('/api/dashboard/summary', { params: { month: monthStr } });
            if (response.data?.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            if (error.response?.status === 401) {
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchProfile();
        fetchDashboard();
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

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-bg justify-center items-center">
                <ActivityIndicator size="large" color="#7C3AED" />
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView className="flex-1 bg-bg justify-center items-center">
                <Text className="text-white text-lg">Failed to load data</Text>
            </SafeAreaView>
        );
    }

    const pieData = data.categories.map((cat, index) => ({
        value: cat.total,
        color: chartColors[index % chartColors.length],
        text: `${cat.percentage}%`,
        textColor: '#fff',
    }));

    const monthLabel = targetDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const topCategory = data.categories?.[0];

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            <View className="px-5 py-2 flex-row justify-between items-center">
                <View>
                    <Text className="text-[24px] font-bold text-text-primary">Dashboard</Text>
                    <Text className="text-[13px] text-text-muted mt-1">Compact cards, quick money read.</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <View className="w-11 h-11 bg-bg-secondary rounded-2xl items-center justify-center border border-border/50">
                        <Text className="text-lg">{avatar}</Text>
                    </View>
                </TouchableOpacity>
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

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
            >
                <ColorCard variant="blue" className="p-5 mb-5">
                    <Text className="text-white/75 text-[12px] font-semibold mb-2">Total Spending</Text>
                    <Text className="text-white text-[34px] font-extrabold tracking-tight mb-4">{data.total.formatted}</Text>

                    <View className="flex-row">
                        <StatMiniCard label="Transactions" value={`${data.recent?.length || 0} recent`} tone="blue" />
                        <StatMiniCard
                            label="Trend"
                            value={
                                data.comparison?.hasLastMonth
                                    ? `${data.comparison.increased ? '+' : '-'}${data.comparison.difference}`
                                    : 'No last month'
                            }
                            tone="coral"
                            isLast
                        />
                    </View>
                </ColorCard>

                <ColorCard variant="purple" className="p-5 mb-5">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <Text className="text-white text-[17px] font-bold mb-1">Category Pulse</Text>
                            <Text className="text-white/70 text-[12px]">
                                {topCategory ? `${topCategory.category} leads this month` : 'No spending yet'}
                            </Text>
                        </View>
                        <View className="rounded-full px-3 py-1.5 bg-white/10 border border-white/10">
                            <Text className="text-white text-[11px] font-bold">{data.categories.length} groups</Text>
                        </View>
                    </View>

                    {data.categories.length > 0 ? (
                        <>
                            <View className="items-center mb-5 mt-1">
                                <PieChart
                                    donut
                                    innerRadius={58}
                                    radius={84}
                                    data={pieData}
                                    centerLabelComponent={() => (
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' }}>Top</Text>
                                            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
                                                {topCategory ? `${topCategory.percentage}%` : '0%'}
                                            </Text>
                                        </View>
                                    )}
                                />
                            </View>

                            <View>
                                {data.categories.slice(0, 4).map((cat, i) => (
                                    <View
                                        key={cat.category}
                                        className={`rounded-[22px] px-4 py-3 mb-3 flex-row items-center ${i === 3 ? 'mb-0' : ''}`}
                                        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                                    >
                                        <View
                                            className="w-11 h-11 rounded-[16px] items-center justify-center mr-3"
                                            style={{ backgroundColor: `${chartColors[i % chartColors.length]}22` }}
                                        >
                                            <Text className="text-[20px]">{cat.icon || typeEmojis[cat.category] || '📦'}</Text>
                                        </View>
                                        <View className="flex-1 mr-2">
                                            <Text className="text-white font-bold text-[13px] mb-1">{cat.category}</Text>
                                            <View className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${Math.min(Math.max(cat.percentage, 4), 100)}%`,
                                                        backgroundColor: chartColors[i % chartColors.length],
                                                    }}
                                                />
                                            </View>
                                        </View>
                                        <View className="items-end min-w-[72px]">
                                            <Text className="text-white font-bold text-[12px]">{cat.formattedTotal}</Text>
                                            <Text className="text-white/70 text-[11px] font-semibold">{cat.percentage}%</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : (
                        <Text className="text-center text-white/70 py-6">No spending this month.</Text>
                    )}
                </ColorCard>

                <ColorCard variant="emerald" className="p-5 mb-4">
                    <View className="flex-row justify-between items-end mb-4">
                        <View>
                            <Text className="text-white text-[17px] font-bold mb-1">Recent Transactions</Text>
                            <Text className="text-white/70 text-[12px]">Small cards, quick scan</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
                            <Text className="text-white text-[12px] font-bold">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {data.recent.length > 0 ? (
                        data.recent.slice(0, 4).map((transaction, index) => (
                            <View
                                key={transaction._id}
                                className={`rounded-[22px] px-4 py-3 flex-row items-center ${index === data.recent.slice(0, 4).length - 1 ? '' : 'mb-3'}`}
                                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                            >
                                <View className="w-11 h-11 rounded-[16px] items-center justify-center mr-3 bg-black/15">
                                    <Text className="text-[20px]">{typeEmojis[transaction.type] || '📦'}</Text>
                                </View>
                                <View className="flex-1 mr-2">
                                    <Text className="text-white font-bold text-[13px] mb-1" numberOfLines={1}>
                                        {transaction.ngapain || 'No notes'}
                                    </Text>
                                    <Text className="text-white/70 text-[11px] font-medium">
                                        {new Date(transaction.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {transaction.pocket}
                                    </Text>
                                </View>
                                <Text className="text-white font-extrabold text-[13px]">
                                    - {transaction.formattedAmount || `Rp ${transaction.amount}`}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text className="text-center text-white/70 py-6">No recent transactions.</Text>
                    )}
                </ColorCard>
            </ScrollView>
        </SafeAreaView>
    );
}
