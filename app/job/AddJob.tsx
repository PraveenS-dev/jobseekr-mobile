import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import TopBar from '../components/TopBar';
import { useForm, Controller } from "react-hook-form";
import DropDownPicker from 'react-native-dropdown-picker';
import { useTheme } from '@/services/Theme';
import { getUser } from '@/services/Auth';
import { StoreJobs } from '@/services/Jobs';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type AddJobProps = NativeStackScreenProps<RootStackParamList, "AddJob">;

const AddJob: React.FC<AddJobProps> = ({ navigation }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { colors, isDark } = useTheme(); // Using theme

    // Dropdown states
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [categoryItems, setCategoryItems] = useState([
        { label: 'Software', value: 'Software' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Design', value: 'Design' },
    ]);

    const [jobTypeOpen, setJobTypeOpen] = useState(false);
    const [jobTypeItems, setJobTypeItems] = useState([
        { label: 'Full Time', value: 'Full Time' },
        { label: 'Part Time', value: 'Part Time' },
        { label: 'Internship', value: 'Internship' },
        { label: 'Contract', value: 'Contract' },
    ]);

    const { control, handleSubmit, formState: { errors } } = useForm({
        mode: "onChange",
        defaultValues: {
            title: "",
            description: "",
            category_id: "",
            location: "",
            salary: "",
            job_type: "",
        },
    });

    useEffect(() => {
        getUser()
            .then(setUser)
            .catch(console.error);
    }, []);

    const onSubmit = async (values: any) => {
        if (!user) {
            Alert.alert("Error", "User data not loaded yet.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("comp_id", String(user.comp_id));
            formData.append("title", values.title);
            formData.append("description", values.description);
            formData.append("category_id", String(values.category_id));
            formData.append("location", values.location);
            formData.append("salary", String(values.salary));
            formData.append("job_type", values.job_type);
            formData.append("created_by", String(user.id));
            formData.append("created_by_name", String(user.name));

            await StoreJobs(formData);
            navigation.navigate("JobList");
        } catch (err) {
            console.error("AddJob error:", err);
            Alert.alert("Error", "Failed to post job.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <TopBar />
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAwareScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    enableOnAndroid
                    extraScrollHeight={100}
                    keyboardOpeningTime={0}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{
                        backgroundColor: colors.surface,
                        padding: 12,
                        borderRadius: 8,
                        shadowColor: colors.cardShadow,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}>
                        {/* Job Title */}
                        <Text style={{ marginTop: 12, marginBottom: 6, color: colors.textPrimary, fontWeight: "600" }}>Job Title</Text>
                        <Controller
                            control={control}
                            name="title"
                            rules={{ required: "Title is required" }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 6,
                                        backgroundColor: colors.inputBackground,
                                        color: colors.inputText,
                                    }}
                                    placeholder="Job title"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        {errors.title && <Text style={{ color: colors.danger, marginTop: 6 }}>{errors.title.message}</Text>}

                        {/* Description */}
                        <Text style={{ marginTop: 12, marginBottom: 6, color: colors.textPrimary, fontWeight: "600" }}>Description</Text>
                        <Controller
                            control={control}
                            name="description"
                            rules={{ required: "Description is required" }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 6,
                                        backgroundColor: colors.inputBackground,
                                        color: colors.inputText,
                                        minHeight: 100,
                                        textAlignVertical: "top",
                                    }}
                                    placeholder="Job description"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    multiline
                                />
                            )}
                        />
                        {errors.description && <Text style={{ color: colors.danger, marginTop: 6 }}>{errors.description.message}</Text>}

                        {/* Category Dropdown */}
                        <Text style={{ marginTop: 12, marginBottom: 6, color: colors.textPrimary, fontWeight: "600" }}>Category</Text>
                        <Controller
                            control={control}
                            name="category_id"
                            rules={{ required: "Category is required" }}
                            render={({ field: { onChange, value } }) => (
                                <DropDownPicker
                                    open={categoryOpen}
                                    value={value || null}
                                    items={categoryItems}
                                    setOpen={setCategoryOpen}
                                    setValue={(valOrFunc) => {
                                        const val = typeof valOrFunc === 'function' ? valOrFunc(value) : valOrFunc;
                                        onChange(val);
                                    }}
                                    setItems={setCategoryItems}
                                    placeholder="Select Category"
                                    zIndex={3000}
                                    zIndexInverse={1000}
                                    dropDownDirection="AUTO"
                                    scrollViewProps={{ nestedScrollEnabled: true }}
                                    style={{ backgroundColor: colors.inputBackground, borderColor: colors.border }}
                                    textStyle={{ color: colors.inputText }}
                                    placeholderStyle={{ color: colors.inputPlaceholder }}
                                    dropDownContainerStyle={{ backgroundColor: colors.surface, borderColor: colors.border }}
                                />
                            )}
                        />
                        {errors.category_id && <Text style={{ color: colors.danger, marginTop: 6 }}>{errors.category_id.message}</Text>}

                        {/* Job Type Dropdown */}
                        <Text style={{ marginTop: 12, marginBottom: 6, color: colors.textPrimary, fontWeight: "600" }}>Job Type</Text>
                        <Controller
                            control={control}
                            name="job_type"
                            rules={{ required: "Job Type is required" }}
                            render={({ field: { onChange, value } }) => (
                                <DropDownPicker
                                    open={jobTypeOpen}
                                    value={value || null}
                                    items={jobTypeItems}
                                    setOpen={setJobTypeOpen}
                                    setValue={(valOrFunc) => {
                                        const val = typeof valOrFunc === 'function' ? valOrFunc(value) : valOrFunc;
                                        onChange(val);
                                    }}
                                    setItems={setJobTypeItems}
                                    placeholder="Select Job Type"
                                    zIndex={2000}
                                    zIndexInverse={2000}
                                    dropDownDirection="AUTO"
                                    containerStyle={{ marginBottom: 10 }}
                                    scrollViewProps={{ nestedScrollEnabled: true }}
                                    style={{ backgroundColor: colors.inputBackground, borderColor: colors.border }}
                                    textStyle={{ color: colors.inputText }}
                                    placeholderStyle={{ color: colors.inputPlaceholder }}
                                    dropDownContainerStyle={{ backgroundColor: colors.surface, borderColor: colors.border }}
                                />
                            )}
                        />
                        {errors.job_type && <Text style={{ color: colors.danger, marginTop: 6 }}>{errors.job_type.message}</Text>}

                        {/* Location */}
                        <Text style={{ marginTop: 12, marginBottom: 6, color: colors.textPrimary, fontWeight: "600" }}>Location</Text>
                        <Controller
                            control={control}
                            name="location"
                            rules={{ required: "Location is required" }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 6,
                                        backgroundColor: colors.inputBackground,
                                        color: colors.inputText,
                                    }}
                                    placeholder="Location"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        {errors.location && <Text style={{ color: colors.danger, marginTop: 6 }}>{errors.location.message}</Text>}

                        {/* Salary */}
                        <Text style={{ marginTop: 12, marginBottom: 6, color: colors.textPrimary, fontWeight: "600" }}>Salary</Text>
                        <Controller
                            control={control}
                            name="salary"
                            rules={{ required: "Salary is required" }}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={{
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 6,
                                        backgroundColor: colors.inputBackground,
                                        color: colors.inputText,
                                    }}
                                    placeholder="Salary"
                                    placeholderTextColor={colors.inputPlaceholder}
                                    keyboardType="numeric"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        {errors.salary && <Text style={{ color: colors.danger, marginTop: 6 }}>{errors.salary.message}</Text>}

                        {/* Submit */}
                        <View style={{ marginTop: 18, alignItems: "flex-end" }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: colors.primary,
                                    paddingVertical: 10,
                                    paddingHorizontal: 18,
                                    borderRadius: 6,
                                    opacity: loading ? 0.7 : 1,
                                }}
                                onPress={handleSubmit(onSubmit)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.accentText} />
                                ) : (
                                    <Text style={{ color: colors.accentText, fontWeight: "700" }}>Post Job</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        </View>
    );
};

export default AddJob;