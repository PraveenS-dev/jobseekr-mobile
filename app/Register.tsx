import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    ScrollView,
    Keyboard,
    Platform,
} from "react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTheme } from "@/services/Theme";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { uniqueEmail, uniqueUserName, UserRegister } from "@/services/Auth";
import { TextInput } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import TopBar from "./components/TopBar";

type RegisterProps = NativeStackScreenProps<RootStackParamList, "Register">;

const Register: React.FC<RegisterProps> = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const { colors } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: "onChange",
    });

    const onSubmit = async (values: any) => {
        try {
            await UserRegister({
                name: values.name,
                username: values.username,
                email: values.email,
                password: values.password,
                password_confirmation: values.password_confirmation,
            });

            navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
            });
        } catch (error: any) {
            console.error("Registration Error:", error);
            Alert.alert("Registration Failed", error.message || "Please try again");
        } finally {
            setLoading(false);
        }
    };


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Please fill the details below
                    </Text>

                    {/* Card Form */}
                    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
                        {/* Name */}
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Full Name</Text>
                        <Controller
                            control={control}
                            name="name"
                            rules={{ required: "Name is required!" }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="person-outline" size={20} color={colors.icon} style={styles.icon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.inputText }]}
                                        placeholder="Enter your full name"
                                        placeholderTextColor={colors.inputPlaceholder}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                </View>
                            )}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

                        {/* Username */}
                        <Text style={[styles.label, { color: colors.textPrimary }]}>User Name</Text>
                        <Controller
                            control={control}
                            name="username"
                            rules={{
                                required: "User Name is required!",
                                validate: async (value) => await uniqueUserName(value),
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="at-outline" size={20} color={colors.icon} style={styles.icon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.inputText }]}
                                        placeholder="Choose a username"
                                        placeholderTextColor={colors.inputPlaceholder}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                </View>
                            )}
                        />
                        {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}

                        {/* email */}
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Email</Text>
                        <Controller
                            control={control}
                            name="email"
                            rules={{
                                required: "Email is required!",
                                validate: async (value) => await uniqueEmail(value),
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color={colors.icon} style={styles.icon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.inputText }]}
                                        placeholder="Enter your email address"
                                        placeholderTextColor={colors.inputPlaceholder}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                </View>
                            )}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                        {/* Password */}
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Password</Text>
                        <Controller
                            control={control}
                            name="password"
                            rules={{ required: "Password is required!" }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="key-outline" size={20} color={colors.icon} style={styles.icon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.inputText }]}
                                        placeholder="Enter your password"
                                        placeholderTextColor={colors.inputPlaceholder}
                                        secureTextEntry={!showPassword}   // 🔹 hide/show toggle
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={colors.icon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

                        {/* Confirm Password */}
                        <Text style={[styles.label, { color: colors.textPrimary }]}>Confirm Password</Text>
                        <Controller
                            control={control}
                            name="password_confirmation"
                            rules={{ required: "Confirm Password is required!" }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="key-outline" size={20} color={colors.icon} style={styles.icon} />
                                    <TextInput
                                        style={[styles.input, { color: colors.inputText }]}
                                        placeholder="Re-enter your password"
                                        placeholderTextColor={colors.inputPlaceholder}
                                        secureTextEntry={!showConfirmPassword}   // 🔹 hide/show toggle
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        <Ionicons
                                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color={colors.icon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        {errors.password_confirmation && (
                            <Text style={styles.errorText}>{errors.password_confirmation.message}</Text>
                        )}

                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Register</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Redirect */}
                    <View style={styles.footer}>
                        <Text style={{ color: colors.textSecondary }}>Are You Employer?</Text>
                        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'EmployerReg' }] })}>
                            <Text style={[styles.link, { color: colors.primary }]}> Register</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.footer}>
                        <Text style={{ color: colors.textSecondary }}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}>
                            <Text style={[styles.link, { color: colors.primary }]}> Login</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default Register;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    card: {
        width: "100%",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 12,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 4,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 6,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginBottom: 6,
        marginTop: -2,
    },
    button: {
        width: "100%",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 12,
    },
    link: {
        fontWeight: "600",
    },
});
