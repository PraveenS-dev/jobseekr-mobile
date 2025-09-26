import { RootStackParamList } from '@/navigation/AppNavigator';
import { login } from '@/services/Auth';
import { useTheme } from '@/services/Theme';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

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
            await login(email, password);
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
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* App Logo / Title */}
                    <View style={styles.header}>
                        <Image
                            source={require("@/assets/images/favicon.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            Welcome Back
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Please sign in to continue
                        </Text>
                    </View>


                    {/* Form */}
                    <View style={styles.form}>
                        <TextInput
                            placeholder="Email"
                            placeholderTextColor={colors.inputPlaceholder}
                            value={email}
                            onChangeText={setEmail}
                            style={[
                                styles.input,
                                {
                                    borderColor: colors.border,
                                    backgroundColor: colors.inputBackground,
                                    color: colors.inputText,
                                },
                            ]}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <View
                            style={[
                                styles.inputWrapper,
                                { borderColor: colors.border, backgroundColor: colors.inputBackground },
                            ]}
                        >
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor={colors.inputPlaceholder}
                                value={password}
                                onChangeText={setPassword}
                                style={[styles.passwordInput, { color: colors.inputText }]}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconBtn}>
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={22}
                                    color={colors.icon}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Button */}
                    <View style={{ width: '100%' }}>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.accent} />
                        ) : (
                            <TouchableOpacity onPress={handleLogin} style={[styles.loginBtn, { backgroundColor: colors.accent }]}>
                                <Text style={[styles.loginText, { color: colors.accentText }]}>
                                    Login
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={{ color: colors.textSecondary }}>Don’t have an account?</Text>
                        <TouchableOpacity
                            onPress={() =>
                                navigation.reset({ index: 0, routes: [{ name: 'Register' }] })
                            }
                        >
                            <Text style={[styles.link, { color: colors.primary }]}> Register</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        marginTop: 12,
    },
    subtitle: {
        fontSize: 15,
        marginTop: 4,
    },
    form: {
        width: "100%",
        gap: 14,
        marginBottom: 20,
    },
    input: {
        width: "100%",
        borderWidth: 1,
        padding: 14,
        borderRadius: 10,
        fontSize: 16,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingRight: 10,
    },
    passwordInput: {
        flex: 1,
        padding: 14,
        fontSize: 16,
    },
    iconBtn: {
        padding: 6,
    },
    loginBtn: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loginText: {
        fontSize: 17,
        fontWeight: "700",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        gap: 4,
    },
    link: {
        fontWeight: "600",
        fontSize: 15,
    },
    logo: {
        width: "30%",
        height: undefined,
        aspectRatio: 1, 
        maxHeight: 150,
        marginBottom: 16,
    },

});
