import { useTheme } from '@/services/Theme';
import { getUserDetails, getUserExp } from '@/services/UserList';
import { fixLocalhostUrl } from '@/services/helpers';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import TopBar from '../components/TopBar';
import { NODE_API } from '@/services/Node_BaseURL';

export type AdminStackParamList = {
    UserProfile: { id: string };
};

const screenWidth = Dimensions.get('window').width;

type Props = NativeStackScreenProps<AdminStackParamList, 'UserProfile'>;


export default function UserProfile({ route, navigation }: Props) {
    const { colors } = useTheme();
    const { id } = route.params;

    const [user, setUser] = useState<any>(null);
    const [userExp, setUserExp] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewCount, setViewCount] = useState<number | null>(null);
    const [viewers, setViewers] = useState<any[]>([]);
    const [viewersVisible, setViewersVisible] = useState(false);
    const [profilePreviewVisible, setProfilePreviewVisible] = useState(false);
    const [resumeVisible, setResumeVisible] = useState(false);

    const progressAnim = useRef(new Animated.Value(0)).current;


    // Fetch user + experience
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [u, exp] = await Promise.all([
                    getUserDetails(id),
                    getUserExp(id),
                ]);
                setUser(u);
                setUserExp(exp);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    // Profile completion percent
    const completionPercent = useMemo(() => {
        if (!user) return 0;
        const fields = ['name', 'email', 'headline', 'phone', 'location', 'resume_link', 'skills', 'preferred_job_type'];
        const filled = fields.filter((f) => Boolean(user?.[f]));
        return Math.floor((filled.length / fields.length) * 100);
    }, [user]);

    // Animate progress bar
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: completionPercent,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [completionPercent]);

    // Fetch view count
    useEffect(() => {
        const fetchViewCount = async () => {
            if (!user?.id) return;
            try {
                const res = await axios.get(`${NODE_API}/profileViewCount/getViewerCount/${user.id}`);
                setViewCount(res.data?.viewCount ?? 0);
            } catch {
                setViewCount(0);
            }
        };
        fetchViewCount();
    }, [user?.id]);

    const openResume = (url: string) => {
        Linking.openURL(fixLocalhostUrl(url));
    };


    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.textSecondary }}>No user found</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <TopBar />

            <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 120 }]}>
                {/* Cover Image */}
                <Image
                    source={{
                        uri: user.cover_image
                            ? fixLocalhostUrl(user.cover_image)
                            : 'https://www.dummyimage.com/1200x375/000/5a57ab&text=COVER',
                    }}
                    style={styles.coverImage}
                />


                <TouchableOpacity activeOpacity={0.9} onPress={() => setProfilePreviewVisible(true)}>
                    <Image
                        source={{
                            uri: user.profile
                                ? fixLocalhostUrl(user.profile)
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=120`,
                        }}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>



                <View style={styles.infoContainer}>
                    <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name}</Text>
                    <Text style={[styles.username, { color: colors.textSecondary }]}>@{user?.username}</Text>
                    <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
                    {user?.headline && <Text style={[styles.headline, { color: colors.accent }]}>{user.headline}</Text>}

                    {/* Profile Completion */}
                    <View style={[styles.card, { backgroundColor: colors.background }]}>
                        <View style={styles.rowBetween}>
                            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Profile Completion</Text>
                            <Text style={[styles.cardTitle, { color: colors.accent }]}>{completionPercent}%</Text>
                        </View>
                        <View style={styles.progressTrack}>
                            <Animated.View style={[styles.progressFill, { backgroundColor: colors.accent, width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
                        </View>
                    </View>

                    {/* About */}
                    <View style={[styles.card, { backgroundColor: colors.background }]}>
                        <Text style={[styles.cardTitle, { color: colors.accent }]}>🧾 About</Text>
                        {user?.name && <Text style={{ color: colors.textPrimary }}>Name: {user.name}</Text>}
                        {user?.headline && <Text style={{ color: colors.textSecondary }}>Headline: {user.headline}</Text>}
                        {user?.preferred_job_type && <Text style={{ color: colors.textSecondary }}>Preferred Job Type: {user.preferred_job_type}</Text>}
                        {user?.location && <Text style={{ color: colors.textSecondary }}>Location: {user.location}</Text>}
                        {!!user?.skills && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                                {String(user.skills).split(',').map((s: string, i: number) => (
                                    <View key={`${s}-${i}`} style={[styles.skillPill, { backgroundColor: colors.surface }]}>
                                        <Text style={[styles.skillText, { color: colors.textPrimary }]}>{s.trim()}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                        {user?.created_at && <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Joined: {user.created_at}</Text>}
                    </View>

                    {/* Experience */}
                    {userExp.length > 0 && (
                        <View style={[styles.card, { backgroundColor: colors.background }]}>
                            <Text style={[styles.cardTitle, { color: colors.accent }]}>🧑‍💼 Experience</Text>
                            <View style={{ gap: 12 }}>
                                {userExp.map((exp, idx) => (
                                    <View key={idx} style={[styles.expItem, { backgroundColor: colors.surface }]}>
                                        <View style={styles.rowBetween}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.expRole, { color: colors.textPrimary }]}>{exp.job_title}</Text>
                                                {!!exp.company_name && <Text style={[styles.expCompany, { color: colors.textSecondary }]}>{exp.company_name}</Text>}
                                            </View>
                                            <Text style={[styles.expDates, { color: colors.textSecondary }]}>{[exp.start_date, exp.end_date].filter(Boolean).join(' - ')}</Text>
                                        </View>
                                        {!!exp.description && <Text style={[styles.expDesc, { color: colors.textPrimary }]}>{exp.description}</Text>}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Contact */}
                    <View style={[styles.card, { backgroundColor: colors.background }]}>
                        <Text style={[styles.cardTitle, { color: colors.accent }]}>📞 Contact</Text>
                        {!!user?.email && <Text style={{ color: colors.textPrimary }}>Email: {user.email}</Text>}
                        {!!user?.phone && <Text style={{ color: colors.textPrimary }}>Phone: {user.phone}</Text>}
                    </View>

                    {/* Activity */}
                    <TouchableOpacity activeOpacity={0.8} style={[styles.card, { backgroundColor: colors.background }]}>
                        <Text style={[styles.cardTitle, { color: colors.accent }]}>🧠 Activity</Text>
                        <Text style={{ color: colors.textPrimary }}>👁️ Views: {viewCount ?? '—'}</Text>
                        <Text style={{ color: colors.textSecondary, fontStyle: 'italic', marginTop: 4 }}>Tap to see recent viewers</Text>
                    </TouchableOpacity>

                    {/* Resume */}
                    {!!user?.resume_link && (
                        <View style={[styles.card, { backgroundColor: colors.background }]}>
                            <Text style={[styles.cardTitle, { color: colors.accent }]}>📄 Resume</Text>
                            <Pressable onPress={() => openResume(user.resume_link)} style={[styles.button, { backgroundColor: colors.accent }]}>
                                <Text style={[styles.buttonText, { color: '#fff' }]}>Open Resume</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Viewers Modal */}
            <Modal visible={viewersVisible} transparent animationType="fade" onRequestClose={() => setViewersVisible(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.rowBetween}>
                            <Text style={[styles.modalTitle, { color: colors.accent }]}>Profile Viewers</Text>
                            <TouchableOpacity onPress={() => setViewersVisible(false)}><Text style={[styles.closeText, { color: colors.textSecondary }]}>✕</Text></TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 420 }}>
                            {!viewers.length ? (
                                <View style={[styles.center, { paddingVertical: 40 }]}>
                                    <Text style={{ color: colors.textSecondary }}>No viewers yet</Text>
                                </View>
                            ) : (
                                viewers.map((v, idx) => (
                                    <View key={`${v?.id || idx}`} style={styles.viewerItem}>
                                        <Image source={{ uri: fixLocalhostUrl(v?.profile_path || v?.profile_url) }} style={styles.viewerAvatar} />
                                        <View style={{ marginLeft: 10, flex: 1 }}>
                                            <Text style={[styles.viewerName, { color: colors.textPrimary }]}>{v?.name}</Text>
                                            {!!v?.username && <Text style={[styles.viewerUsername, { color: colors.textSecondary }]}>@{v.username}</Text>}
                                            {!!v?.email && <Text style={[styles.viewerEmail, { color: colors.textSecondary }]}>{v.email}</Text>}
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Profile Preview Modal */}
            <Modal visible={profilePreviewVisible} transparent animationType="fade" onRequestClose={() => setProfilePreviewVisible(false)}>
                <View style={styles.modalBackdrop}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setProfilePreviewVisible(false)} />
                    <View style={[styles.modalCard, { padding: 0 }]}>
                        <TouchableOpacity onPress={() => setProfilePreviewVisible(false)} style={{ position: 'absolute', right: 12, top: 12, zIndex: 2 }}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                        <Image source={{ uri: fixLocalhostUrl(user.profile) }} style={{ width: '100%', height: 420, borderRadius: 16 }} resizeMode="cover" />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContainer: { alignItems: 'center', width: '100%' },
    coverImage: { width: screenWidth, height: 200, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#fff',
        position: 'absolute',
        top: -40,
        marginLeft: -180
    },

    infoContainer: { marginTop: 80, alignItems: 'center', paddingHorizontal: 20, width: '100%', maxWidth: 720 },
    name: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
    username: { fontSize: 16, marginVertical: 5 },
    email: { fontSize: 16, marginBottom: 5 },
    headline: { fontSize: 16, fontStyle: 'italic' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    card: { width: '100%', borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 16, borderColor: '#e5e7eb', backgroundColor: '#ffffff' },
    rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
    progressTrack: { width: '100%', height: 10, borderRadius: 8, overflow: 'hidden', backgroundColor: '#e5e7eb' },
    progressFill: {
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#2563eb',
    },
    skillPill: { borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#eff6ff', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, marginRight: 6, marginTop: 6 },
    skillText: { fontSize: 13, fontWeight: '600', color: '#1f2937' },
    expItem: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#f9fafb' },
    expRole: { fontSize: 16, fontWeight: '700' },
    expCompany: { fontSize: 13, marginTop: 2 },
    expDates: { fontSize: 12 },
    expDesc: { fontSize: 13, marginTop: 8, lineHeight: 18 },
    viewerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#e5e7eb' },
    viewerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ddd' },
    viewerName: { fontSize: 15, fontWeight: '700' },
    viewerUsername: { fontSize: 12, marginTop: 2 },
    viewerEmail: { fontSize: 12, marginTop: 2 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
    modalCard: { width: '100%', maxWidth: 720, borderWidth: 1, borderRadius: 16, padding: 16, backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
    closeText: { fontSize: 18, color: '#6b7280' },
    button: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#2563eb' },
    buttonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
