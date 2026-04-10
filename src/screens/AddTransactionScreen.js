import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../api/axios';

const theme = {
    pageBackground: '#110E09',
    cardBackground: '#1B1711',
    cardBorder: '#2D2619',
    cardShadow: '#000000',
    inputBackground: '#262016',
    inputBorder: '#332B1D',
    textPrimary: '#FFF4D6',
    textSecondary: '#C3B38D',
    textMuted: '#8F8160',
    accent: '#F5B233',
    accentStrong: '#D89517',
    accentSoft: '#3D2B0C',
    accentSurface: '#F6E1A4',
    chipBackground: '#231D13',
    chipDisabled: '#2B261F',
    overlay: '#080604',
    sheetBackground: '#F8F1E2',
    sheetHandle: '#D2C29B',
    sheetText: '#17120B',
    sheetSelected: '#F6E6B8',
};

const types = [
    { name: 'Eat', icon: '\u{1F37D}\uFE0F', accent: '#FF8A3D' },
    { name: 'Snack', icon: '\u{1F37F}', accent: '#FF4D6D' },
    { name: 'Groceries', icon: '\u{1F6D2}', accent: '#22C55E' },
    { name: 'Laundry', icon: '\u{1F9FA}', accent: '#06B6D4' },
    { name: 'Bensin', icon: '\u26FD', accent: '#F59E0B' },
    { name: 'Flazz', icon: '\u{1F4B3}', accent: '#7C3AED' },
    { name: 'Home Appliance', icon: '\u{1F3E0}', accent: '#8B5CF6' },
    { name: 'Jumat Berkah', icon: '\u{1F932}', accent: '#10B981' },
    { name: 'Uang Sampah', icon: '\u{1F5D1}\uFE0F', accent: '#64748B' },
    { name: 'Uang Keamanan', icon: '\u{1F46E}', accent: '#0EA5E9' },
    { name: 'Medicine', icon: '\u{1F48A}', accent: '#EF4444' },
    { name: 'Others', icon: '\u{1F4E6}', accent: '#A855F7' },
];

const pockets = [
    { name: 'Kwintals', icon: '\u{1F4B0}', accent: '#F59E0B' },
    { name: 'Groceries', icon: '\u{1F966}', accent: '#22C55E' },
    { name: 'Weekday Transport', icon: '\u{1F68C}', accent: '#1677FF' },
    { name: 'Weekend Transport', icon: '\u{1F697}', accent: '#0EA5E9' },
    { name: 'Investasi', icon: '\u{1F4C8}', accent: '#8B5CF6' },
    { name: 'Bandung', icon: '\u26F0\uFE0F', accent: '#14B8A6' },
    { name: 'Sedeqah', icon: '\u{1F932}', accent: '#F97316' },
    { name: 'IPL', icon: '\u{1F3D8}\uFE0F', accent: '#EC4899' },
];

const celebrationMessages = [
    { emoji: '\u{1F389}', text: 'Great job tracking!' },
    { emoji: '\u{1F4AA}', text: 'Discipline = Freedom!' },
    { emoji: '\u{1F525}', text: "You're on fire!" },
    { emoji: '\u2728', text: 'Every Rupiah counts!' },
    { emoji: '\u{1F3C6}', text: 'Champion move!' },
    { emoji: '\u{1F4CA}', text: 'Data is power!' },
    { emoji: '\u{1F680}', text: 'Finances on track!' },
    { emoji: '\u{1F48E}', text: 'Smart money move!' },
];

const getBudgetMonths = () => {
    const dates = [];
    const now = new Date();

    for (let i = -1; i <= 1; i += 1) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        dates.push({
            label: date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
            value: { month: date.getMonth() + 1, year: date.getFullYear() },
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        });
    }

    return dates;
};

const formatAmount = (digits) => {
    if (!digits) return '0';
    return Number(digits).toLocaleString('id-ID');
};

const formatDateTimeLabel = (value) => {
    const dateLabel = value.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const timeLabel = value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateLabel} \u00B7 ${timeLabel}`;
};

function Card({ children, style }) {
    return (
        <View
            style={[
                {
                    backgroundColor: theme.cardBackground,
                    borderRadius: 28,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: theme.cardBorder,
                    elevation: 10,
                    shadowColor: theme.cardShadow,
                    shadowOffset: { width: 0, height: 18 },
                    shadowOpacity: 0.22,
                    shadowRadius: 24,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

function BottomSheet({ visible, title, items, selectedValue, onClose, onSelect, bottomInset }) {
    const { height: screenHeight } = useWindowDimensions();
    const sheetHeight = Math.min(Math.max(360, (items.length * 58) + 130 + bottomInset), screenHeight * 0.78);
    const closedOffset = sheetHeight + bottomInset + 48;
    const [isMounted, setIsMounted] = useState(visible);
    const translateY = useRef(new Animated.Value(closedOffset)).current;
    const dragStartRef = useRef(0);
    const isClosingRef = useRef(false);

    const backdropOpacity = translateY.interpolate({
        inputRange: [0, closedOffset],
        outputRange: [0.36, 0],
        extrapolate: 'clamp',
    });

    const animateOpen = useCallback(() => {
        translateY.stopAnimation();
        Animated.spring(translateY, {
            toValue: 0,
            tension: 82,
            friction: 12,
            useNativeDriver: true,
        }).start();
    }, [translateY]);

    const finishClose = useCallback((afterClose) => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        translateY.stopAnimation();
        Animated.timing(translateY, {
            toValue: closedOffset,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            isClosingRef.current = false;
            if (!finished) return;
            setIsMounted(false);
            afterClose?.();
        });
    }, [closedOffset, translateY]);

    const requestClose = useCallback(() => {
        finishClose(onClose);
    }, [finishClose, onClose]);

    useEffect(() => {
        if (visible) {
            setIsMounted(true);
            translateY.setValue(closedOffset);
            requestAnimationFrame(animateOpen);
        } else if (isMounted) {
            finishClose();
        }
    }, [animateOpen, closedOffset, finishClose, isMounted, translateY, visible]);

    const panResponder = useMemo(() => PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
            Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 3,
        onPanResponderGrant: () => {
            translateY.stopAnimation((value) => {
                dragStartRef.current = value;
            });
        },
        onPanResponderMove: (_, gestureState) => {
            const projected = dragStartRef.current + gestureState.dy;
            const nextValue = projected < 0 ? projected * 0.22 : projected;
            translateY.setValue(Math.min(closedOffset, nextValue));
        },
        onPanResponderRelease: (_, gestureState) => {
            const shouldClose = gestureState.vy > 1 || gestureState.dy > sheetHeight * 0.18;

            if (shouldClose) {
                requestClose();
                return;
            }

            Animated.spring(translateY, {
                toValue: 0,
                tension: 92,
                friction: 13,
                useNativeDriver: true,
            }).start();
        },
        onPanResponderTerminate: () => {
            Animated.spring(translateY, {
                toValue: 0,
                tension: 92,
                friction: 13,
                useNativeDriver: true,
            }).start();
        },
    }), [closedOffset, requestClose, sheetHeight, translateY]);

    if (!isMounted) return null;

    return (
        <Modal visible={isMounted} transparent animationType="none" statusBarTranslucent onRequestClose={requestClose}>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={requestClose}>
                    <Animated.View
                        pointerEvents="none"
                        style={[
                            StyleSheet.absoluteFillObject,
                            { backgroundColor: theme.overlay, opacity: backdropOpacity },
                        ]}
                    />
                </TouchableOpacity>

                <Animated.View
                    style={{
                        transform: [{ translateY }],
                        height: sheetHeight,
                        backgroundColor: theme.sheetBackground,
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,
                        paddingHorizontal: 20,
                        paddingBottom: Math.max(bottomInset, 16) + 12,
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: -10 },
                        shadowOpacity: 0.18,
                        shadowRadius: 18,
                        elevation: 20,
                    }}
                >
                    <View {...panResponder.panHandlers} style={{ paddingTop: 14, paddingBottom: 12, alignItems: 'center' }}>
                        <View style={{ width: 52, height: 5, borderRadius: 999, backgroundColor: theme.sheetHandle }} />
                    </View>

                    <Text style={{ fontSize: 18, fontWeight: '800', color: theme.sheetText, marginBottom: 12 }}>{title}</Text>

                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces={false}>
                        {items.map((item) => {
                            const isSelected = selectedValue === item.name;

                            return (
                                <TouchableOpacity
                                    key={item.name}
                                    onPress={() => {
                                        onSelect(item.name);
                                        requestClose();
                                    }}
                                    activeOpacity={0.7}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 14,
                                        paddingHorizontal: 14,
                                        borderRadius: 18,
                                        marginBottom: 8,
                                        backgroundColor: isSelected ? theme.sheetSelected : 'transparent',
                                    }}
                                >
                                    <Text style={{ fontSize: 18, marginRight: 10 }}>{item.icon}</Text>
                                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: theme.sheetText }}>{item.name}</Text>
                                    {isSelected && <Text style={{ fontSize: 16, fontWeight: '800', color: theme.accentStrong }}>{'\u2713'}</Text>}
                                </TouchableOpacity>
                            );
                        })}
                        <View style={{ height: 10 }} />
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

function FieldRow({ label, value, icon, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#2B2418',
            }}
        >
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary }}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {icon && <Text style={{ fontSize: 14, marginRight: 6 }}>{icon}</Text>}
                <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginRight: 4 }}>{value}</Text>
                <Text style={{ fontSize: 14, color: theme.textMuted }}>{'\u203A'}</Text>
            </View>
        </TouchableOpacity>
    );
}

export default function AddTransactionScreen({ navigation }) {
    const budgetMonthsList = useMemo(() => getBudgetMonths(), []);
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    const amountInputRef = useRef(null);

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
    const [successMsg, setSuccessMsg] = useState({ emoji: '\u{1F389}', text: '' });
    const [showTypeSheet, setShowTypeSheet] = useState(false);
    const [showPocketSheet, setShowPocketSheet] = useState(false);
    const [isEditingAmount, setIsEditingAmount] = useState(false);

    const selectedType = types.find((item) => item.name === type) || types[0];
    const selectedPocket = pockets.find((item) => item.name === pocket) || pockets[0];
    const formattedAmount = formatAmount(amount);
    const contentMinHeight = Math.max(windowHeight - insets.top - insets.bottom - 140, 0);

    useEffect(() => {
        fetchClosedMonths();
    }, []);

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
        } catch (error) {
            // Keep the screen usable when budget metadata is unavailable.
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
    };

    const handleSave = async () => {
        if (!amount || !ngapain.trim()) {
            Alert.alert('Error', 'Please fill in the Amount and Notes fields.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/api/transaction', {
                amount: parseInt(amount, 10),
                ngapain: ngapain.trim(),
                type,
                pocket,
                budgetMonth: budgetMonth.value.month,
                budgetYear: budgetMonth.value.year,
                date: date.toISOString(),
            });

            const message = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
            setSuccessMsg(message);
            setShowSuccessModal(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to save.';
            Alert.alert('Error', errorMessage);
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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.pageBackground }} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: theme.textPrimary }}>Add Transaction</Text>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        minHeight: contentMinHeight,
                        paddingHorizontal: 20,
                        paddingTop: 28,
                        paddingBottom: Math.max(44, insets.bottom + 28),
                        justifyContent: 'center',
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Card style={{ padding: 0, width: '100%', maxWidth: 420, alignSelf: 'center' }}>
                        <TouchableOpacity
                            onPress={() => setIsEditingAmount(true)}
                            activeOpacity={0.9}
                            style={{ alignItems: 'center', paddingVertical: 30, paddingHorizontal: 18 }}
                        >
                            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textSecondary, marginBottom: 6 }}>Amount</Text>
                            {isEditingAmount ? (
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: theme.accent, marginBottom: 4 }}>Rp</Text>
                                    <TextInput
                                        ref={amountInputRef}
                                        style={{ fontSize: 38, fontWeight: '800', color: theme.textPrimary, textAlign: 'center', width: '100%' }}
                                        placeholder="0"
                                        placeholderTextColor={theme.textMuted}
                                        keyboardType="numeric"
                                        value={amount}
                                        onChangeText={handleAmountChange}
                                        onBlur={() => setIsEditingAmount(false)}
                                        selectTextOnFocus
                                    />
                                </View>
                            ) : (
                                <>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: theme.accent, marginBottom: 4 }}>Rp</Text>
                                    <Text style={{ fontSize: 38, fontWeight: '800', color: theme.textPrimary }}>{formattedAmount}</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={{ paddingHorizontal: 18, paddingVertical: 14 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textSecondary, marginBottom: 8 }}>Description</Text>
                            <TextInput
                                style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: theme.textPrimary,
                                    backgroundColor: theme.inputBackground,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: theme.inputBorder,
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                }}
                                placeholder="What did you spend on?"
                                placeholderTextColor={theme.textMuted}
                                value={ngapain}
                                onChangeText={setNgapain}
                            />
                        </View>

                        <View style={{ paddingHorizontal: 18 }}>
                            <FieldRow
                                label="Category"
                                value={selectedType.name}
                                icon={selectedType.icon}
                                onPress={() => setShowTypeSheet(true)}
                            />
                            <FieldRow
                                label="Pocket"
                                value={selectedPocket.name}
                                icon={selectedPocket.icon}
                                onPress={() => setShowPocketSheet(true)}
                            />
                            <FieldRow
                                label="Date & Time"
                                value={formatDateTimeLabel(date)}
                                onPress={() => setShowDatePicker(true)}
                            />
                        </View>

                        <View style={{ paddingHorizontal: 18, paddingVertical: 16 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textSecondary, marginBottom: 10 }}>Budget Month</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {budgetMonthsList.map((month) => {
                                    const isClosed = closedMonthKeys.includes(month.key);
                                    const isSelected = budgetMonth.label === month.label;

                                    return (
                                        <TouchableOpacity
                                            key={month.label}
                                            onPress={() => !isClosed && setBudgetMonth(month)}
                                            disabled={isClosed}
                                            activeOpacity={0.7}
                                            style={{
                                                flex: 1,
                                                borderRadius: 16,
                                                paddingVertical: 12,
                                                alignItems: 'center',
                                                backgroundColor: isClosed ? theme.chipDisabled : isSelected ? theme.accentSoft : theme.chipBackground,
                                                borderWidth: 1,
                                                borderColor: isSelected ? theme.accent : isClosed ? '#3C3428' : '#322A1E',
                                                opacity: isClosed ? 0.55 : 1,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: '700',
                                                    color: isClosed ? theme.textMuted : isSelected ? theme.accentSurface : theme.textPrimary,
                                                }}
                                            >
                                                {isClosed ? `\u{1F512} ${month.label}` : month.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18 }}>
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={loading}
                                activeOpacity={0.9}
                                style={{
                                    backgroundColor: theme.accent,
                                    borderRadius: 28,
                                    height: 54,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    shadowColor: theme.accent,
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.28,
                                    shadowRadius: 16,
                                    elevation: 8,
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#130E06" />
                                ) : (
                                    <Text style={{ color: '#130E06', fontWeight: '800', fontSize: 15 }}>Save Transaction</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Card>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            <BottomSheet
                visible={showTypeSheet}
                title="Expense Type"
                items={types}
                selectedValue={type}
                onClose={() => setShowTypeSheet(false)}
                onSelect={setType}
                bottomInset={insets.bottom}
            />
            <BottomSheet
                visible={showPocketSheet}
                title="Pocket Source"
                items={pockets}
                selectedValue={pocket}
                onClose={() => setShowPocketSheet(false)}
                onSelect={setPocket}
                bottomInset={insets.bottom}
            />

            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(8,6,4,0.62)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                    <View
                        style={{
                            backgroundColor: theme.cardBackground,
                            width: '100%',
                            borderRadius: 28,
                            padding: 24,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: theme.cardBorder,
                            elevation: 10,
                            shadowColor: '#000000',
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.22,
                            shadowRadius: 18,
                        }}
                    >
                        <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: theme.accentSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                            <Text style={{ fontSize: 32 }}>{successMsg.emoji}</Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: '800', color: theme.textPrimary, marginBottom: 6 }}>Transaction Saved</Text>
                        <Text style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 20, textAlign: 'center' }}>{successMsg.text}</Text>

                        <TouchableOpacity
                            onPress={handleAddAnother}
                            activeOpacity={0.9}
                            style={{ width: '100%', backgroundColor: theme.accent, borderRadius: 18, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}
                        >
                            <Text style={{ color: '#130E06', fontWeight: '800', fontSize: 14 }}>Add Another</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleGoHome}
                            activeOpacity={0.9}
                            style={{ width: '100%', backgroundColor: theme.inputBackground, borderRadius: 18, height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.inputBorder }}
                        >
                            <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>Go to Dashboard</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
