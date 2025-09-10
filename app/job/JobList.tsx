import { Animated, FlatList, Text, TextInput, TouchableOpacity, View, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import { useTheme } from '@/services/Theme';
import { getUser } from '@/services/Auth';
import { FetchJobs } from '@/services/Jobs';
import { LARAVEL_API } from '@/services/Laravel_BaseURL';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';

type JobListScreenProp = NativeStackNavigationProp<RootStackParamList, 'JobList'>;

const JobList = () => {
    const { colors, isDark } = useTheme();
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [initialLoading, setInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [User, setUser] = useState(null);
    const [bookmarkedJobIds, setBookmarkedJobIds] = useState<String[]>([]);
    const requestIdRef = useRef(0);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation<JobListScreenProp>();

    type RawJob = {
        _id: string;
        title: string;
        description?: string;
        category_id?: string;
        location?: string;
        salary?: string;
        job_type?: string;
        is_approved?: string | number;
        is_closed?: string | number;
        created_at?: string;
        status?: number;
        profile_path?: string;
        enc_id?: string;
    };

    const mapJobs = (j: RawJob) => ({
        id: String(j._id),
        job_name: j.title,
        description: j.description ?? '',
        category: j.category_id,
        location: j.location ?? '',
        salary: j.salary ?? '',
        job_type: j.job_type ?? '',
        is_approved: j.is_approved ?? '',
        is_closed: j.is_closed ?? '',
        created_at: j.created_at ?? '',
        status: Number(j.status ?? 1),
        profile_path: j.profile_path,
        enc_id: j.enc_id,
    });

    const fetchJobs = useCallback(
        async (opts) => {
            if (!User) return;
            const background = !!opts?.background;
            const q = opts?.q ?? searchTerm;
            !background ? setInitialLoading(true) : setIsFetching(true);
            const myRequestId = ++requestIdRef.current;

            try {
                const list = await FetchJobs(q, User.role, User.id);
                if (myRequestId !== requestIdRef.current) return;
                setJobs(list.map(mapJobs));
            } catch (err) {
                console.error('Error fetching Jobs:', err);
                if (!background) Alert.alert('Error', 'Failed to load jobs');
            } finally {
                !background ? setInitialLoading(false) : setIsFetching(false);
            }
        },
        [searchTerm, User]
    );

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getUser();
                setUser(data);
            } catch (err) {
                console.error('Error fetching user:', err);
                setInitialLoading(false);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (User) fetchJobs({ background: false });
    }, [User, fetchJobs]);

    useEffect(() => {
        if (!User) return;
        const delay = setTimeout(() => fetchJobs({ background: true }), 400);
        return () => clearTimeout(delay);
    }, [searchTerm, fetchJobs, User]);
    const fetchBookmarks = async () => {
        try {
            const res = await LARAVEL_API.get('/bookmark/getdata');
            const bookmarks = res.data?.data?.job_book_mark || [];
            setBookmarkedJobIds(bookmarks.map((b) => String(b.job_id)));
        } catch (err) {
            console.error('Failed to fetch bookmarks:', err);
        }
    };

    useEffect(() => {
        if (!User) return;
        fetchBookmarks();
    }, [User]);


    const bookmarkJob = async (id: string) => {
        try {
            setBookmarkedJobIds(prev => [...prev, id]);
            await LARAVEL_API.post('/bookmark/store', { job_id: id });
        } catch (err) {
            console.error('Failed to bookmark job:', err);
            setBookmarkedJobIds(prev => prev.filter(jobId => jobId !== id));
        }
    };

    const removeBookmark = async (id: string) => {
        try {
            setBookmarkedJobIds(prev => prev.filter(jobId => jobId !== id));
            await LARAVEL_API.post('/bookmark/remove', { job_id: id });
        } catch (err) {
            console.error('Failed to remove bookmark:', err);
            setBookmarkedJobIds(prev => [...prev, id]);
        }
    };

    const handleView = (item: { id: string }) => {
        navigation.navigate('JobView', { id: item.id });
    };
    const handleBookmarkView = () => {
        navigation.navigate('Bookmarks');
    };
    const handleApplicationView = () => {
        navigation.navigate('ApplicationList');
    };
    const handleAddJobView = () => {
        navigation.navigate('AddJob');
    };

    const ItemRow: React.FC<{
        item: any;
        onView: (item: any) => void;
    }> = ({ item, onView }) => {
        const fade = useRef(new Animated.Value(0)).current;
        useEffect(() => {
            Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
        }, [fade]);

        const isBookmarked = bookmarkedJobIds.includes(item.id);

        return (
            <Animated.View style={[styles.jobCardContainer, { opacity: fade }]}>
                <LinearGradient
                    colors={['#3B82F6', '#60A5FA', '#93C5FD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBorder}
                >
                    <View style={[styles.jobCard, { backgroundColor: isDark ? colors.surface : colors.surface }]}>
                        <View style={styles.header}>
                            <Text style={[styles.jobName, { color: isDark ? colors.textPrimary : colors.textPrimary }]}>
                                {item.job_name}
                            </Text>

                            <TouchableOpacity
                                onPress={() => (isBookmarked ? removeBookmark(item.id) : bookmarkJob(item.id))}
                                style={{ padding: 6 }}
                            >
                                <Ionicons
                                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                                    size={22}
                                    color={isBookmarked ? colors.accent : colors.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        {item.description && (
                            <Text
                                style={{
                                    color: isDark ? colors.textSecondary : '#4B5563',
                                    marginBottom: 16,
                                    fontSize: 14,
                                    lineHeight: 20,
                                }}
                            >
                                {item.description.length > 150 ? item.description.slice(0, 150) + '...' : item.description}
                            </Text>
                        )}

                        <LinearGradient
                            colors={['#3B82F6', '#2563EB']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.buttonGradient}
                        >
                            <TouchableOpacity style={styles.button} onPress={() => onView(item)}>
                                <Text style={styles.buttonText}>View Job</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </LinearGradient>
            </Animated.View>
        );
    };

    type Job = {
        id: string;
        job_name: string;
        description: string;
        category: string;
        location: string;
        salary: string;
        job_type: string;
        is_approved: string;
        is_closed: string;
        created_at: string;
        status: number;
        profile_path?: string;
        enc_id?: string;
    };

    const renderItem = ({ item }: { item: Job }) => <ItemRow item={item} onView={handleView} />;
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchJobs({ background: true });
            await fetchBookmarks();
        } catch (err) {
            console.error(err);
        } finally {
            setRefreshing(false);
        }
    };

    const ListEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color={colors.inputPlaceholder} />
            <Text style={{ color: colors.inputPlaceholder, fontSize: 16, marginTop: 8, textAlign: 'center' }}>
                No jobs found.
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TopBar />

            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
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
                            onSubmitEditing={() => fetchJobs({ background: true, q: searchTerm })}
                        />
                        {isFetching && <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: 8 }} />}
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            setSearchTerm('');
                            fetchJobs({ background: true, q: '' });
                        }}
                        style={[styles.resetButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
                    >
                        <Ionicons name="refresh-outline" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.actionButtonRow}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={handleBookmarkView}
                >
                    <Text style={[styles.actionButtonText, { color: colors.accentText }]}>Bookmarks</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.success }]}
                    onPress={handleApplicationView}
                >
                    <Text style={[styles.actionButtonText, { color: colors.accentText }]}>Job Applications</Text>
                </TouchableOpacity>

                {User?.role != 1 && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.accent }]}
                        onPress={handleAddJobView}
                    >
                        <Text style={[styles.actionButtonText, { color: colors.accentText }]}>Create Job Post </Text>
                    </TouchableOpacity>
                )}
            </View>


            {initialLoading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 160, paddingTop: 10, paddingHorizontal: 16 }}
                    ListEmptyComponent={ListEmpty}
                    keyboardShouldPersistTaps="handled"
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

const styles = StyleSheet.create({

    actionButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginVertical: 12,
        gap: 7,
    },

    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },

    actionButtonText: {
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center',
    },


    container: { flex: 1 },
    searchSection: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    jobCardContainer: { marginBottom: 20 },
    gradientBorder: { borderRadius: 16, padding: 1, elevation: 6 },
    jobCard: { borderRadius: 15, padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    jobName: { fontSize: 20, fontWeight: 'bold', flex: 1, marginRight: 8 },
    buttonGradient: {
        borderRadius: 12,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    button: { paddingVertical: 12, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
});

export default JobList;
