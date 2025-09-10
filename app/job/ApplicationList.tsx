import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    TextInput,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { useTheme } from "@/services/Theme";
import TopBar from "../components/TopBar";
import { fetchApplications, FetchJobs } from "@/services/Jobs";
import { getUser } from "@/services/Auth";
import dayjs from "dayjs";

type ApplicationListProps = NativeStackScreenProps<
    RootStackParamList,
    "ApplicationList"
>;

const ApplicationList: React.FC<ApplicationListProps> = ({ navigation }) => {
    const { colors } = useTheme();
    const [applications, setApplications] = useState<any>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getUser().then(setUser).catch(console.error);
    }, []);

    const fetchAllApplications = async () => {
        try {
            setLoading(true);
            const res = await fetchApplications();
            setApplications(res);
        } catch (err) {
            console.error("Error fetching applications", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobs = async (query = "") => {
        if (!user) return;
        try {
            setLoading(true);
            const jobList = await FetchJobs(query, user.role, user.id);
            setJobs(jobList);
        } catch (err) {
            console.error("Error fetching jobs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAllApplications();
            fetchJobs();
        }
    }, [user, searchTerm]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchApplications();
        await fetchJobs();
        setRefreshing(false);
    };

    const submitHandler = () => {
        fetchApplications();
        fetchJobs(searchTerm);
    };

    const resetHandler = () => {
        setSearchTerm("");
        fetchAllApplications();
        fetchJobs();
    };

    const viewApplication = (id: string) => {
        navigation.navigate("ApplicationView", { id });
    };

    const renderItem = ({ item, index }) => {
        const matchedJob = jobs.find((job) => job._id === item.job_id);
        if (!matchedJob) return null;

        const fadeAnim = new Animated.Value(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();

        return (
            <Animated.View style={{ opacity: fadeAnim, marginBottom: 20 }}>
                <LinearGradient
                    colors={["#3B82F6", "#60A5FA", "#93C5FD"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBorder}
                >
                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                                <Text style={[{ color: colors.textPrimary }]}>{matchedJob.title}</Text>
                            </Text>
                        </View>

                        <Text style={styles.cardText}>
                            <Ionicons name="pricetag" size={14} color="#3B82F6" />{" "}
                            <Text style={[{ color: colors.textPrimary }]}>{matchedJob.category_id}</Text>
                        </Text>
                        <Text style={styles.cardText}>
                            <Ionicons name="location" size={14} color="#EF4444" />{" "}
                            <Text style={[{ color: colors.textPrimary }]}>{matchedJob.location}</Text>
                        </Text>

                        <View style={styles.rowBetween}>
                            <Text style={styles.cardText}>
                                <Ionicons name="cash" size={14} color="#22C55E" /> ₹
                                <Text style={[{ color: colors.textPrimary }]}>{matchedJob.salary}</Text>
                            </Text>
                            <Text style={styles.cardText}>
                                <Ionicons name="person" size={14} color="#A855F7" />{" "}
                                <Text style={[{ color: colors.textPrimary }]}>{item.created_by}</Text>
                            </Text>
                        </View>

                        <View style={styles.rowBetween}>
                            <Text style={styles.cardText}>
                                <Ionicons name="briefcase" size={14} color="#EAB308" />{" "}
                                <Text style={[{ color: colors.textPrimary }]}>{matchedJob.job_type}</Text>
                            </Text>
                            <Text style={styles.cardText}>
                                <Ionicons name="time" size={14} color="#F97316" />{" "}
                                <Text style={[{ color: colors.textPrimary }]}>{dayjs(item.created_at).format("DD-MMMM-YYYY hh:mm A")}</Text>
                            </Text>
                        </View>

                        <LinearGradient
                            colors={["#3B82F6", "#2563EB"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => viewApplication(item.enc_id)}
                            >
                                <Text style={styles.buttonText}>View Application</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TopBar />

            {/* Search Section */}
            <View style={styles.searchSection}>
                <View
                    style={[
                        styles.searchInputWrapper,
                        {
                            backgroundColor: colors.inputBackground,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Ionicons
                        name="search"
                        size={20}
                        color={colors.inputPlaceholder}
                    />
                    <TextInput
                        placeholder="Search applications..."
                        placeholderTextColor={colors.inputPlaceholder}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        style={{
                            flex: 1,
                            color: colors.inputText,
                            marginLeft: 8,
                            fontSize: 16,
                        }}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="search"
                        onSubmitEditing={submitHandler}
                    />
                    {loading && (
                        <ActivityIndicator
                            size="small"
                            color={colors.accent}
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </View>

                <TouchableOpacity
                    onPress={resetHandler}
                    style={[
                        styles.resetButton,
                        { backgroundColor: colors.inputBackground, borderColor: colors.border },
                    ]}
                >
                    <Ionicons name="refresh-outline" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* List */}
            {loading ? (
                <ActivityIndicator
                    size="large"
                    color={colors.accent}
                    style={{ marginTop: 20 }}
                />
            ) : applications.length === 0 ? (
                <Text
                    style={{ textAlign: "center", marginTop: 20, color: colors.textSecondary }}
                >
                    No Applications found.
                </Text>
            ) : (
                <FlatList
                    data={applications}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.enc_id + index}
                    contentContainerStyle={{
                        paddingBottom: 160,
                        paddingTop: 10,
                        paddingHorizontal: 16,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#3B82F6"]}
                            tintColor="#3B82F6"
                        />
                    }
                />
            )}
        </View>
    );
};

export default ApplicationList;

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchSection: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: "row",
        gap: 8,
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    resetButton: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    gradientBorder: { borderRadius: 16, padding: 1, elevation: 6 },
    card: { borderRadius: 15, padding: 20 },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    cardTitle: { fontSize: 20, fontWeight: "bold", flex: 1, marginRight: 8 },
    cardText: { fontSize: 14, marginBottom: 6, color: "#4B5563" },
    rowBetween: { flexDirection: "row", justifyContent: "space-between" },
    buttonGradient: {
        borderRadius: 12,
        marginTop: 12,
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    button: { paddingVertical: 12, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
