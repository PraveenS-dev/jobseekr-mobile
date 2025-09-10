import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FetchBookMarks, FetchJobs, removeBookmark } from '@/services/Jobs';
import { getUser } from '@/services/Auth';
import { useTheme } from '@/services/Theme';
import TopBar from '../components/TopBar';

const Bookmarks = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [bookmarks, setBookmarks] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getUser().then(setUser).catch(console.error);
    }, []);

    const fetchBookmarkList = async (query = '') => {
        if (!user) return;
        setLoading(true);
        try {
            const bookmarkList = await FetchBookMarks(query);
            setBookmarks(bookmarkList);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchJobList = async (query = '') => {
        if (!user) return;
        setLoading(true);
        try {
            const jobList = await FetchJobs(query, user.role, user.id);
            setJobs(jobList);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (id: string) => {
        try {
            await removeBookmark(id);
            fetchBookmarkList();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchBookmarkList();
            fetchJobList(searchTerm);
        }
    }, [user, searchTerm]);

    const submitHandler = () => {
        fetchBookmarkList(searchTerm);
        fetchJobList(searchTerm);
    };

    const resetHandler = () => {
        setSearchTerm('');
        fetchBookmarkList();
        fetchJobList();
    };

    const viewJob = (id: string) => {
        navigation.navigate('JobView', { id });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchJobList();
            await fetchBookmarkList();
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    const renderJob = ({ item }) => {
        const matchedJob = jobs.find((job) => job._id === item.job_id);
        if (!matchedJob) return null;

        const fade = new Animated.Value(0);
        Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();

        return (
            <Animated.View style={{ opacity: fade, marginBottom: 20 }}>
                <LinearGradient
                    colors={['#3B82F6', '#60A5FA', '#93C5FD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBorder}
                >
                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <View style={styles.cardHeader}>
                            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                                {matchedJob.title}
                            </Text>
                            <TouchableOpacity onPress={() => handleRemoveBookmark(matchedJob._id)}>
                                <Ionicons name="bookmark" size={22} color={colors.accent} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.cardText}>
                            <Text style={[styles.bold, { color: colors.orange }]}>Category: </Text><Text style={[ { color: colors.textPrimary }]}>{matchedJob.category_id}</Text>
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={[styles.bold, { color: colors.orange }]}>Location: </Text><Text style={[ { color: colors.textPrimary }]}>{matchedJob.location}</Text>
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={[styles.bold, { color: colors.orange }]}>Salary: </Text><Text style={[ { color: colors.textPrimary }]}>₹{matchedJob.salary}</Text>
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={[styles.bold, { color: colors.orange }]}>Type: </Text><Text style={[ { color: colors.textPrimary }]}>{matchedJob.job_type}</Text>
                        </Text>

                        <LinearGradient
                            colors={['#3B82F6', '#2563EB']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <TouchableOpacity style={styles.button} onPress={() => viewJob(matchedJob._id)}>
                                <Text style={styles.buttonText}>View Job</Text>
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

            <View style={styles.searchSection}>
                <View style={[styles.searchInputWrapper, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.inputPlaceholder} />
                    <TextInput
                        placeholder="Search jobs..."
                        placeholderTextColor={colors.inputPlaceholder}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        style={{ flex: 1, color: colors.inputText, marginLeft: 8, fontSize: 16 }}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="search"
                        onSubmitEditing={submitHandler}
                    />
                    {loading && <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: 8 }} />}
                </View>

                <TouchableOpacity
                    onPress={resetHandler}
                    style={[styles.resetButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                >
                    <Ionicons name="refresh-outline" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />
            ) : bookmarks.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>
                    No bookmarks found.
                </Text>
            ) : (
                <FlatList
                    data={bookmarks}
                    renderItem={renderJob}
                    keyExtractor={(item, index) => item.job_id + index}
                    contentContainerStyle={{ paddingBottom: 160, paddingTop: 10, paddingHorizontal: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3B82F6']}
                            tintColor="#3B82F6"
                        />
                    }
                />
            )}
        </View>
    );
};

export default Bookmarks;

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', gap: 8 },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    gradientBorder: { borderRadius: 16, padding: 1, elevation: 6 },
    card: { borderRadius: 15, padding: 20 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, marginRight: 8 },
    cardText: { fontSize: 14, marginBottom: 6, color: '#4B5563' },
    bold: { fontWeight: '600', color: '#1E3A8A' },
    buttonGradient: {
        borderRadius: 12,
        marginTop: 12,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    button: { paddingVertical: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
