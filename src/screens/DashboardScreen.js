import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';
import api from '../api/axios';

const chartColors = ['#F5A623', '#FF4D6D', '#22C55E', '#1677FF', '#06B6D4', '#F97316', '#3B82F6', '#EC4899', '#FBBF24', '#14B8A6'];
const typeEmojis = {
    Eat: '🍽️', Snack: '🍿', Groceries: '🛒', Laundry: '🧺',
    Bensin: '⛽', Flazz: '💳', 'Home Appliance': '🏠', 'Jumat Berkah': '🤲',
    'Uang Sampah': '🗑️', 'Uang Keamanan': '👮', Medicine: '💊', Others: '📦',
};

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

export default function DashboardScreen({ setIsAuthenticated, navigation }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [avatar, setAvatar] = useState('👤');
    const [targetDate, setTargetDate] = useState(new Date());

    useEffect(() => { fetchProfile(); }, []);
    useEffect(() => { fetchDashboard(); }, [targetDate]);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/api/auth/me');
            if (response.data?.user) setAvatar(response.data.user.avatar || '👤');
        } catch (error) { /* silent */ }
    };

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const monthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
            const response = await api.get('/api/dashboard/summary', { params: { month: monthStr } });
            if (response.data?.success) setData(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            if (error.response?.status === 401) setIsAuthenticated(false);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => { setRefreshing(true); fetchProfile(); fetchDashboard(); };
    const handlePrevMonth = () => { const d = new Date(targetDate); d.setMonth(d.getMonth() - 1); setTargetDate(d); };
    const handleNextMonth = () => { const d = new Date(targetDate); d.setMonth(d.getMonth() + 1); setTargetDate(d); };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#F5A623" />
            </SafeAreaView>
        );
    }

    if (!data) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#1A1A1A', fontSize: 15, fontWeight: '600' }}>Failed to load data</Text>
            </SafeAreaView>
        );
    }

    const pieData = data.categories.map((cat, index) => ({
        value: cat.total,
        color: chartColors[index % chartColors.length],
        text: `${cat.percentage}%`,
        textColor: '#333333',
    }));

    const monthLabel = targetDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const topCategory = data.categories?.[0];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1A1A' }}>Dashboard</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF9E6', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 18 }}>{avatar}</Text>
                    </View>
                </TouchableOpacity>
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

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 }}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" />}
            >
                {/* Total Spending Card */}
                <Card style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666', marginBottom: 4 }}>Total Spending</Text>
                    <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 }}>{data.total.formatted}</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1, backgroundColor: '#FFF9E6', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666', marginBottom: 2 }}>Transactions</Text>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }}>{data.recent?.length || 0} recent</Text>
                        </View>
                        <View style={{ flex: 1, backgroundColor: '#FFF9E6', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 }}>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666', marginBottom: 2 }}>Trend</Text>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: data.comparison?.increased ? '#EF4444' : '#22C55E' }}>
                                {data.comparison?.hasLastMonth
                                    ? `${data.comparison.increased ? '+' : '-'}${data.comparison.difference}`
                                    : 'No prior month'}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Category Breakdown Card */}
                <Card style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A' }}>Categories</Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666' }}>{data.categories.length} groups</Text>
                    </View>

                    {data.categories.length > 0 ? (
                        <>
                            <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                <PieChart
                                    donut
                                    innerRadius={50}
                                    radius={72}
                                    data={pieData}
                                    centerLabelComponent={() => (
                                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: '#666666', fontSize: 10, fontWeight: '600' }}>Top</Text>
                                            <Text style={{ color: '#1A1A1A', fontSize: 16, fontWeight: '800' }}>
                                                {topCategory ? `${topCategory.percentage}%` : '0%'}
                                            </Text>
                                        </View>
                                    )}
                                />
                            </View>

                            {data.categories.slice(0, 4).map((cat, i) => (
                                <View
                                    key={cat.category}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 10,
                                    }}
                                >
                                    <Text style={{ fontSize: 18, marginRight: 10 }}>{typeEmojis[cat.category] || '📦'}</Text>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 }}>{cat.category}</Text>
                                        <View style={{ height: 4, borderRadius: 2, backgroundColor: '#FFF9E6', overflow: 'hidden' }}>
                                            <View
                                                style={{
                                                    height: '100%',
                                                    borderRadius: 2,
                                                    width: `${Math.min(Math.max(cat.percentage, 4), 100)}%`,
                                                    backgroundColor: chartColors[i % chartColors.length],
                                                }}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', minWidth: 72 }}>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1A1A' }}>{cat.formattedTotal}</Text>
                                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666' }}>{cat.percentage}%</Text>
                                    </View>
                                </View>
                            ))}
                        </>
                    ) : (
                        <Text style={{ textAlign: 'center', color: '#666666', paddingVertical: 20 }}>No spending this month.</Text>
                    )}
                </Card>

                {/* Recent Transactions Card */}
                <Card style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#1A1A1A' }}>Recent Transactions</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#F5A623' }}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {data.recent.length > 0 ? (
                        data.recent.slice(0, 5).map((tx, index) => (
                            <View
                                key={tx._id}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 10,
                                }}
                            >
                                <Text style={{ fontSize: 18, marginRight: 10 }}>{typeEmojis[tx.type] || '📦'}</Text>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1A1A1A' }} numberOfLines={1}>{tx.ngapain || 'No notes'}</Text>
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#666666', marginTop: 2 }}>
                                        {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} · {tx.pocket}
                                    </Text>
                                </View>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: '#EF4444' }}>
                                    - {tx.formattedAmount || `Rp ${tx.amount}`}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ textAlign: 'center', color: '#666666', paddingVertical: 20 }}>No recent transactions.</Text>
                    )}
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}
