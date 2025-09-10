import { login } from '@/services/Auth';
import { useTheme } from '@/services/Theme';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { RootStackParamList } from '.';

type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Login'
>;

type LoginProps = {
    navigation: LoginScreenNavigationProp;
};

export default function Login({ navigation }: LoginProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { colors } = useTheme();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            const data = await login(email, password);
            console.log("Login Success:", data);

            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });

        } catch (error: any) {
            console.error("Login Error:", error);
            Alert.alert('Login Failed', error.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={{ fontSize: 32, marginBottom: 20, color: colors.textPrimary, fontWeight: '700' }}>Login</Text>

                    <View style={{ width: '100%', gap: 12 }}>
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor={colors.inputPlaceholder}
                            value={email}
                            onChangeText={setEmail}
                            style={{
                                width: '100%',
                                borderWidth: 1,
                                borderColor: colors.border,
                                backgroundColor: colors.inputBackground,
                                color: colors.inputText,
                                padding: 12,
                                borderRadius: 8,
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <View style={{
                            flexDirection: 'row', alignItems: 'center', width: '100%',
                            borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingRight: 8,
                            backgroundColor: colors.inputBackground,
                        }}>
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor={colors.inputPlaceholder}
                                value={password}
                                onChangeText={setPassword}
                                style={{ flex: 1, padding: 12, color: colors.inputText }}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 6 }}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ height: 16 }} />

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.accent} />
                    ) : (
                        <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: colors.accent, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 10, width: '100%' }}>
                            <Text style={{ color: colors.accentText, textAlign: 'center', fontWeight: '700', fontSize: 16 }}>Login</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
