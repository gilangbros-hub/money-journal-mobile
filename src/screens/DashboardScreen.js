import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';
import api from '../api/axios';

const chartColors = ['#FF4D6D', '#7C3AED', '#22C55E', '#F59E0B', '#06B6D4', '#F97316', '#3B82F6', '#EC4899', '#FBBF24', '#14B8A6'];
const typeEmojis = {
    'Eat': '🍽️', 'Snack': '🍿', 'Groceries': '🛒', 'Laundry': '🧺',
    'Bensin': '⛽', 'Flazz': '💳', 'Home Appliance': '🏠', 'Jumat Berkah': '🤲',
    'Uang Sampah': '🗑️', 'Uang Keamanan': '👮', 'Medicine': '💊', 'Others': '📦'
};


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
            if (response.data && response.data.user) {
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
            if (response.data && response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            if (error.response && error.response.status === 401) {
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

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            {/* Header */}
            <View className="px-5 py-2 mb-2 flex-row justify-between items-center z-10">
                <Text className="text-[22px] font-bold text-text-primary">Dashboard</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <View className="w-10 h-10 bg-bg-secondary rounded-full items-center justify-center border border-border/50">
                        <Text className="text-lg">{avatar}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Month Navigation for Dashboard too */}
            <View className="px-5 py-2 flex-row items-center justify-between z-10">
                <TouchableOpacity onPress={handlePrevMonth} className="w-10 h-10 bg-bg-secondary rounded-xl items-center justify-center border border-border/50">
                    <Text className="text-text-secondary text-lg font-bold">←</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold text-text-primary">{monthLabel}</Text>
                <TouchableOpacity onPress={handleNextMonth} className="w-10 h-10 bg-bg-secondary rounded-xl items-center justify-center border border-border/50">
                    <Text className="text-text-secondary text-lg font-bold">→</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }} 
                className="flex-1 mt-2" 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
            >
                
                {/* Hero Card */}
                <View className="bg-primary rounded-3xl p-6 mb-6 shadow-sm relative overflow-hidden">
                    <Text className="text-white/80 font-medium mb-1">Total Spending</Text>
                    <Text className="text-white text-[32px] font-extrabold mb-3 tracking-tighter">{data.total.formatted}</Text>
                    
                    {data.comparison && data.comparison.hasLastMonth && (
                        <View className="flex-row items-center bg-white/20 self-start px-3 py-1.5 rounded-xl">
                            <Text className="text-white font-bold mr-1">
                                {data.comparison.increased ? '📈' : '📉'} 
                            </Text>
                            <Text className="text-white font-semibold text-xs">
                                {data.comparison.increased ? '+' : '-'}{data.comparison.difference} from last month
                            </Text>
                        </View>
                    )}
                </View>

                {/* Chart Section */}
                <View className="bg-bg-secondary rounded-3xl p-5 mb-6 shadow-sm border border-border/50">
                    <Text className="text-[17px] font-bold text-text-primary mb-5">Categories</Text>
                    
                    {data.categories.length > 0 ? (
                        <View className="items-center mb-6 mt-2">
                            <PieChart
                                donut
                                innerRadius={65}
                                radius={90}
                                data={pieData}
                                centerLabelComponent={() => {
                                    return (
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '600' }}>Total</Text>
                                            <Text style={{ color: '#0F172A', fontSize: 22, fontWeight: '800' }}>{data.categories.length}</Text>
                                        </View>
                                    );
                                }}
                            />
                        </View>
                    ) : (
                        <Text className="text-center text-text-muted py-5">No spending this month.</Text>
                    )}

                    {/* Category List */}
                    <View className="flex-col gap-3">
                        {data.categories.map((cat, i) => (
                            <View key={cat.category} className="flex-row items-center">
                                <View className="w-11 h-11 rounded-2xl items-center justify-center mr-3 bg-bg-tertiary">
                                    <Text className="text-[22px]">{cat.icon || typeEmojis[cat.category] || '📦'}</Text>
                                </View>
                                <View className="flex-1 justify-center mr-2">
                                    <Text className="text-text-primary font-semibold text-[13px] mb-1.5">{cat.category}</Text>
                                    <View className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                        <View 
                                            className="h-full rounded-full" 
                                            style={{ width: `${Math.min(Math.max(cat.percentage, 4), 100)}%`, backgroundColor: chartColors[i % chartColors.length] }} 
                                        />
                                    </View>
                                </View>
                                <View className="items-end min-w-[80px]">
                                    <Text className="text-text-primary font-bold text-[13px] mb-0.5">{cat.formattedTotal}</Text>
                                    <Text className="text-text-muted text-[11px] font-bold">{cat.percentage}%</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Recent Transactions */}
                <View className="mb-4">
                    <View className="flex-row justify-between items-end mb-4 px-1">
                        <Text className="text-[17px] font-bold text-text-primary">Recent Transactions</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
                            <Text className="text-primary font-bold text-sm">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {data.recent.length > 0 ? (
                        <View className="flex-col gap-3">
                            {data.recent.map(t => (
                                <View key={t._id} className="bg-bg-secondary p-3.5 rounded-2xl flex-row items-center shadow-sm border border-border/50">
                                    <View className="w-11 h-11 bg-bg-tertiary rounded-xl items-center justify-center mr-3">
                                        <Text className="text-[20px]">{typeEmojis[t.type] || '📦'}</Text>
                                    </View>
                                    <View className="flex-1 mr-2">
                                        <Text className="text-text-primary font-semibold text-[13px] mb-1" numberOfLines={1}>{t.ngapain || 'No notes'}</Text>
                                        <Text className="text-text-muted text-[11px] font-medium">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} • {t.pocket}</Text>
                                    </View>
                                    <Text className="text-coral font-bold text-[13px]">- {t.formattedAmount || `Rp ${t.amount}`}</Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text className="text-center text-text-muted py-5">No recent transactions.</Text>
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
