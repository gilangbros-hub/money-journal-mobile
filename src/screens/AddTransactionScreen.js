import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/axios';

const types = [
    { name: 'Eat', icon: '🍽️', accent: '#FF8A3D' },
    { name: 'Snack', icon: '🍿', accent: '#FF4D6D' },
    { name: 'Groceries', icon: '🛒', accent: '#22C55E' },
    { name: 'Laundry', icon: '🧺', accent: '#06B6D4' },
    { name: 'Bensin', icon: '⛽', accent: '#F59E0B' },
    { name: 'Flazz', icon: '💳', accent: '#7C3AED' },
    { name: 'Home Appliance', icon: '🏠', accent: '#8B5CF6' },
    { name: 'Jumat Berkah', icon: '🤲', accent: '#10B981' },
    { name: 'Uang Sampah', icon: '🗑️', accent: '#64748B' },
    { name: 'Uang Keamanan', icon: '👮', accent: '#0EA5E9' },
    { name: 'Medicine', icon: '💊', accent: '#EF4444' },
    { name: 'Others', icon: '📦', accent: '#A855F7' },
];

const pockets = [
    { name: 'Kwintals', icon: '💰', accent: '#F59E0B' },
    { name: 'Groceries', icon: '🥦', accent: '#22C55E' },
    { name: 'Weekday Transport', icon: '🚌', accent: '#1677FF' },
    { name: 'Weekend Transport', icon: '🚗', accent: '#0EA5E9' },
    { name: 'Investasi', icon: '📈', accent: '#8B5CF6' },
    { name: 'Bandung', icon: '⛰️', accent: '#14B8A6' },
    { name: 'Sedeqah', icon: '🤲', accent: '#F97316' },
    { name: 'IPL', icon: '🏘️', accent: '#EC4899' },
];

const celebrationMessages = [
    { emoji: '🎉', text: 'Great job tracking!' },
    { emoji: '💪', text: 'Discipline = Freedom!' },
    { emoji: '🔥', text: "You're on fire!" },
    { emoji: '✨', text: 'Every Rupiah counts!' },
    { emoji: '🏆', text: 'Champion move!' },
    { emoji: '📊', text: 'Data is power!' },
    { emoji: '🚀', text: 'Finances on track!' },
    { emoji: '💎', text: 'Smart money move!' },
];

const cardShell = {
    backgroundColor: '#1256C8',
    borderWidth: 1,
    borderColor: 'rgba(90, 166, 255, 0.28)',
    shadowColor: '#1677FF',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
};

const glassPill = {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.18)',
};

const getBudgetMonths = () => {
    const dates = [];
    const now = new Date();
    for (let i = -1; i <= 1; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        dates.push({
            label: d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
            value: { month: d.getMonth() + 1, year: d.getFullYear() },
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        });
    }
    return dates;
};

const formatAmount = (digits) => {
    if (!digits) return '0';
    return Number(digits).toLocaleString('id-ID');
};

const formatDateTimeLabel = (value) => {
    const dateLabel = value.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
    });
    const timeLabel = value.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${dateLabel} • ${timeLabel}`;
};

function CardContainer({ children, style }) {
    return (
        <View className="rounded-[32px] overflow-hidden" style={[cardShell, style]}>
            {children}
        </View>
    );
}

function ChipSelector({ title, items, selectedValue, onSelect }) {
    return (
        <View className="mb-4">
            <Text className="text-white/75 text-[12px] font-semibold mb-3">{title}</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 10 }}
            >
                {items.map((item) => {
                    const isSelected = selectedValue === item.name;
                    return (
                        <TouchableOpacity
                            key={item.name}
                            onPress={() => onSelect(item.name)}
                            activeOpacity={0.85}
                            className="mr-3 px-3 py-2.5 rounded-[18px] border flex-row items-center"
                            style={{
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.16)' : 'rgba(5, 14, 37, 0.22)',
                                borderColor: isSelected ? item.accent : 'rgba(255,255,255,0.12)',
                            }}
                        >
                            <Text style={{ fontSize: 14, marginRight: 6 }}>{item.icon}</Text>
                            <Text
                                className="text-[12px] font-bold"
                                style={{ color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.8)' }}
                            >
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

function CategorySheet({ visible, items, selectedValue, onClose, onSelect, bottomInset }) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 justify-end bg-black/60">
                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
                <View
                    className="bg-bg rounded-t-[28px] border-t border-border/60 px-5 pt-5"
                    style={{ paddingBottom: Math.max(bottomInset, 16) + 12 }}
                >
                    <View className="w-12 h-1.5 rounded-full bg-border self-center mb-5" />
                    <Text className="text-text-primary text-[18px] font-bold mb-1">Choose Category</Text>
                    <Text className="text-text-muted text-[13px] mb-4">Tap one to update the main transaction card.</Text>
                    <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                        {items.map((item) => {
                            const isSelected = selectedValue === item.name;
                            return (
                                <TouchableOpacity
                                    key={item.name}
                                    onPress={() => {
                                        onSelect(item.name);
                                        onClose();
                                    }}
                                    className="rounded-[22px] border px-4 py-4 mb-3 flex-row items-center justify-between"
                                    style={{
                                        backgroundColor: isSelected ? 'rgba(22, 119, 255, 0.16)' : '#1E293B',
                                        borderColor: isSelected ? item.accent : 'rgba(148, 163, 184, 0.14)',
                                    }}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-11 h-11 rounded-[16px] items-center justify-center mr-3"
                                            style={{ backgroundColor: `${item.accent}22` }}
                                        >
                                            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                                        </View>
                                        <Text className="text-text-primary text-[14px] font-bold flex-1">{item.name}</Text>
                                    </View>
                                    <Text className="text-[16px]" style={{ color: isSelected ? item.accent : '#64748B' }}>
                                        {isSelected ? '✓' : '›'}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

export default function AddTransactionScreen({ navigation }) {
    const budgetMonthsList = useMemo(() => getBudgetMonths(), []);
    const insets = useSafeAreaInsets();
    const detailAnim = useRef(new Animated.Value(0)).current;

    const [amount, setAmount] = useState('');
    const [ngapain, setNgapain] = useState('');
    const [type, setType] = useState('Eat');
    const [pocket, setPocket] = useState('Kwintals');
    const [budgetMonth, setBudgetMonth] = useState(budgetMonthsList[1]);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [closedMonthKeys, setClosedMonthKeys] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState({ emoji: '🎉', text: '' });
    const [showCategorySheet, setShowCategorySheet] = useState(false);
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
    const amountInputRef = useRef(null);

    const selectedType = types.find((item) => item.name === type) || types[0];
    const selectedPocket = pockets.find((item) => item.name === pocket) || pockets[0];
    const formattedAmount = formatAmount(amount);

    useEffect(() => {
        fetchClosedMonths();
    }, []);

    useEffect(() => {
        Animated.timing(detailAnim, {
            toValue: isDetailsExpanded ? 1 : 0,
            duration: 180,
            useNativeDriver: false,
        }).start();
    }, [detailAnim, isDetailsExpanded]);

    useEffect(() => {
        if (isEditingAmount && amountInputRef.current) {
            amountInputRef.current.focus();
        }
    }, [isEditingAmount]);

    const fetchClosedMonths = async () => {
        try {
            const response = await api.get('/api/budget/closed-months');
            if (response.data?.data) {
                const keys = response.data.data.map((closedMonth) => closedMonth.key);
                setClosedMonthKeys(keys);
                if (keys.includes(budgetMonth.key)) {
                    const firstOpen = budgetMonthsList.find((month) => !keys.includes(month.key));
                    if (firstOpen) setBudgetMonth(firstOpen);
                }
            }
        } catch (err) {
            // Keep the screen usable even if this request fails.
        }
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const handleAmountChange = (value) => {
        setAmount(value.replace(/[^0-9]/g, ''));
    };

    const resetForm = () => {
        setAmount('');
        setNgapain('');
        setType('Eat');
        setPocket('Kwintals');
        const firstOpen = budgetMonthsList.find((month) => !closedMonthKeys.includes(month.key));
        setBudgetMonth(firstOpen || budgetMonthsList[1]);
        setDate(new Date());
        setIsEditingAmount(false);
        setIsDetailsExpanded(false);
    };

    const handleSave = async () => {
        if (!amount || !ngapain.trim()) {
            Alert.alert('Error', 'Please fill in the Amount and Notes (Ngapain) fields.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                amount: parseInt(amount, 10),
                ngapain: ngapain.trim(),
                type,
                pocket,
                budgetMonth: budgetMonth.value.month,
                budgetYear: budgetMonth.value.year,
                date: date.toISOString(),
            };

            await api.post('/api/transaction', payload);

            const msg = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
            setSuccessMsg(msg);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Save error', error);
            const errMsg = error.response?.data?.message || 'Failed to save transaction.';
            Alert.alert('Error', errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAnother = () => {
        setShowSuccessModal(false);
        resetForm();
    };

    const handleGoHome = () => {
        setShowSuccessModal(false);
        resetForm();
        navigation.navigate('Dashboard');
    };

    const detailsHeight = detailAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 210],
    });

    const detailsOpacity = detailAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
                    <View>
                        <Text className="text-text-primary text-[24px] font-bold">Add Transaction</Text>
                        <Text className="text-text-muted text-[13px] mt-1">Everything lives in one editable card.</Text>
                    </View>
                    <View className="w-11 h-11 rounded-2xl bg-bg-secondary border border-border/50 items-center justify-center">
                        <Text style={{ fontSize: 20 }}>{selectedType.icon}</Text>
                    </View>
                </View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 8,
                        paddingBottom: 160 + insets.bottom,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <CardContainer>
                        <View className="px-5 pt-5 pb-6">
                            <View className="flex-row justify-between items-center mb-5">
                                <TouchableOpacity
                                    className="rounded-full border px-3 py-2 flex-row items-center max-w-[58%]"
                                    style={glassPill}
                                    onPress={() => setShowCategorySheet(true)}
                                    activeOpacity={0.85}
                                >
                                    <Text style={{ fontSize: 14, marginRight: 6 }}>{selectedType.icon}</Text>
                                    <Text className="text-white text-[12px] font-semibold mr-2" numberOfLines={1}>
                                        {selectedType.name}
                                    </Text>
                                    <Text className="text-white/70 text-[14px]">›</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="rounded-full border px-3 py-2 flex-row items-center"
                                    style={glassPill}
                                    onPress={() => setShowDatePicker(true)}
                                    activeOpacity={0.85}
                                >
                                    <Text style={{ fontSize: 14, marginRight: 6 }}>🗓️</Text>
                                    <Text className="text-white text-[12px] font-semibold mr-2">{formatDateTimeLabel(date)}</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="mb-5">
                                <Text className="text-white/75 text-[12px] font-semibold mb-2">Description</Text>
                                <TextInput
                                    className="text-white text-[16px] font-semibold border rounded-[20px] px-4 py-3"
                                    style={{
                                        borderColor: ngapain ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.12)',
                                        backgroundColor: 'rgba(5, 14, 37, 0.18)',
                                    }}
                                    placeholder="What did you spend on?"
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={ngapain}
                                    onChangeText={setNgapain}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={() => setIsEditingAmount(true)}
                                activeOpacity={0.92}
                                className="rounded-[28px] border px-4 py-5 mb-5 items-center"
                                style={{
                                    borderColor: isEditingAmount ? '#FFFFFF' : 'rgba(255,255,255,0.12)',
                                    backgroundColor: isEditingAmount ? 'rgba(5, 14, 37, 0.28)' : 'rgba(5, 14, 37, 0.18)',
                                }}
                            >
                                <Text className="text-white/75 text-[12px] font-semibold mb-2">Amount</Text>
                                {isEditingAmount ? (
                                    <View className="w-full items-center">
                                        <Text className="text-white/75 text-[16px] font-bold mb-1">Rp</Text>
                                        <TextInput
                                            ref={amountInputRef}
                                            className="text-white text-[40px] font-extrabold tracking-tight text-center w-full"
                                            placeholder="0"
                                            placeholderTextColor="rgba(255,255,255,0.45)"
                                            keyboardType="numeric"
                                            value={amount}
                                            onChangeText={handleAmountChange}
                                            onBlur={() => setIsEditingAmount(false)}
                                            selectTextOnFocus
                                        />
                                    </View>
                                ) : (
                                    <>
                                        <Text className="text-white/75 text-[16px] font-bold mb-1">Rp</Text>
                                        <Text className="text-white text-[42px] font-extrabold tracking-tight">{formattedAmount}</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <ChipSelector title="Expense Type" items={types} selectedValue={type} onSelect={setType} />
                            <ChipSelector title="Pocket Source" items={pockets} selectedValue={pocket} onSelect={setPocket} />

                            <View className="mt-1 rounded-[24px] border border-white/12 bg-black/15 overflow-hidden">
                                <TouchableOpacity
                                    className="px-4 py-4 flex-row items-center justify-between"
                                    onPress={() => setIsDetailsExpanded((current) => !current)}
                                    activeOpacity={0.85}
                                >
                                    <View>
                                        <Text className="text-white text-[14px] font-bold">Timing & Budget</Text>
                                        <Text className="text-white/65 text-[12px] mt-1">
                                            {formatDateTimeLabel(date)} • {budgetMonth.label}
                                        </Text>
                                    </View>
                                    <Text
                                        className="text-white/80 text-[18px]"
                                        style={{ transform: [{ rotate: isDetailsExpanded ? '90deg' : '0deg' }] }}
                                    >
                                        ›
                                    </Text>
                                </TouchableOpacity>

                                <Animated.View
                                    style={{
                                        height: detailsHeight,
                                        opacity: detailsOpacity,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <View className="px-4 pb-4">
                                        <TouchableOpacity
                                            className="bg-white/8 rounded-[18px] border border-white/10 px-4 py-4 mb-4"
                                            onPress={() => setShowDatePicker(true)}
                                            activeOpacity={0.85}
                                        >
                                            <Text className="text-white/65 text-[12px] font-medium mb-1">Date & Time</Text>
                                            <Text className="text-white text-[14px] font-bold">{formatDateTimeLabel(date)}</Text>
                                        </TouchableOpacity>

                                        <Text className="text-white/65 text-[12px] font-medium mb-3 px-1">Budget Month</Text>
                                        <View className="flex-row justify-between">
                                            {budgetMonthsList.map((month) => {
                                                const isClosed = closedMonthKeys.includes(month.key);
                                                const isSelected = budgetMonth.label === month.label;
                                                return (
                                                    <TouchableOpacity
                                                        key={month.label}
                                                        onPress={() => !isClosed && setBudgetMonth(month)}
                                                        disabled={isClosed}
                                                        activeOpacity={0.85}
                                                        className="w-[31%] rounded-[18px] px-2 py-3 border items-center"
                                                        style={{
                                                            backgroundColor: isClosed ? 'rgba(51, 65, 85, 0.9)' : isSelected ? 'rgba(255,255,255,0.16)' : 'rgba(5, 14, 37, 0.24)',
                                                            borderColor: isClosed ? 'rgba(148, 163, 184, 0.14)' : isSelected ? '#5AA6FF' : 'rgba(255,255,255,0.12)',
                                                            opacity: isClosed ? 0.45 : 1,
                                                        }}
                                                    >
                                                        <Text
                                                            className="text-[12px] font-bold"
                                                            style={{ color: isClosed ? '#94A3B8' : isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.82)' }}
                                                        >
                                                            {isClosed ? `Locked ${month.label}` : month.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </Animated.View>
                            </View>
                        </View>
                    </CardContainer>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </ScrollView>

                <View
                    className="absolute left-0 right-0 px-5 pt-4 border-t border-border/40"
                    style={{
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.96)',
                        paddingBottom: Math.max(insets.bottom, 16),
                    }}
                >
                    <TouchableOpacity
                        style={{
                            width: '100%',
                            backgroundColor: '#7C3AED',
                            borderRadius: 20,
                            height: 58,
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#7C3AED',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.28,
                            shadowRadius: 16,
                            elevation: 8,
                        }}
                        onPress={handleSave}
                        disabled={loading}
                        activeOpacity={0.9}
                    >
                        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Save Transaction</Text>}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            <CategorySheet
                visible={showCategorySheet}
                items={types}
                selectedValue={type}
                onClose={() => setShowCategorySheet(false)}
                onSelect={setType}
                bottomInset={insets.bottom}
            />

            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(2, 6, 23, 0.72)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#0F172A',
                            width: '100%',
                            borderRadius: 28,
                            padding: 28,
                            borderWidth: 1,
                            borderColor: 'rgba(90, 166, 255, 0.18)',
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                width: 76,
                                height: 76,
                                borderRadius: 24,
                                backgroundColor: 'rgba(22, 119, 255, 0.16)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <Text style={{ fontSize: 40 }}>{successMsg.emoji}</Text>
                        </View>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: '#F8FAFC', marginBottom: 8 }}>
                            Transaction Saved
                        </Text>
                        <Text style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24, textAlign: 'center', lineHeight: 20 }}>
                            {successMsg.text}
                        </Text>

                        <TouchableOpacity
                            style={{
                                width: '100%',
                                backgroundColor: '#1677FF',
                                borderRadius: 18,
                                height: 52,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 12,
                            }}
                            onPress={handleAddAnother}
                            activeOpacity={0.9}
                        >
                            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Add Another Transaction</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                width: '100%',
                                backgroundColor: '#1E293B',
                                borderRadius: 18,
                                height: 52,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: '#334155',
                            }}
                            onPress={handleGoHome}
                            activeOpacity={0.9}
                        >
                            <Text style={{ color: '#F8FAFC', fontWeight: '700', fontSize: 15 }}>Go to Dashboard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
