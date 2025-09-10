import { getUser } from '@/services/Auth';
import { fixLocalhostUrl, formatDate } from '@/services/helpers';
import { useTheme } from '@/services/Theme';
import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopBar from '../components/TopBar';
import { getUserDetails, getUserExp } from '@/services/UserList';
import { NODE_API } from '@/services/Node_BaseURL';
import dayjs from 'dayjs';

const screenWidth = Dimensions.get('window').width;

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [viewCount, setViewCount] = useState<number | null>(null);
    const [viewers, setViewers] = useState<any[]>([]);
    const [viewersVisible, setViewersVisible] = useState(false);
    const [profilePreviewVisible, setProfilePreviewVisible] = useState(false);
    const [resumeVisible, setResumeVisible] = useState(false);
    const [webViewAvailable, setWebViewAvailable] = useState<boolean | null>(null);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const { colors } = useTheme();
    const [userExp, setUserExp] = useState<any[]>([]);
    const [trackWidth, setTrackWidth] = useState(0);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUser();
                setUser(data);
            } catch (err) {
                console.error('Error fetching user:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [exp] = await Promise.all([
                    getUserExp(user?.id),
                ]);
                setUserExp(exp);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.id]);

    const completionPercent = useMemo(() => {
        if (!user) return 0;
        const fields = ['name', 'email', 'headline', 'phone', 'location', 'resume_link', 'skills', 'preferred_job_type'];
        const filled = fields.filter((f) => Boolean(user?.[f]));
        return Math.floor((filled.length / fields.length) * 100);
    }, [user]);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: completionPercent,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [completionPercent]);

    useEffect(() => {
        const fetchViewCount = async (id: string | number) => {
            try {
                const res = await NODE_API.get(`/profileViewCount/getViewerCount/${id}`);
                setViewCount(res.data?.viewCount ?? 0);
            } catch (e) {
                setViewCount(0);
            }
        };
        if (user?.id) fetchViewCount(user.id);
    }, [user?.id]);

    const openViewers = async () => {
        if (!user?.id) return;

        try {
            const res = await NODE_API.get(`/profileViewCount/getViewerIds/${user.id}`);
            const ids: string[] = res.data?.viewer_ids || [];
            console.log(res);

            if (!ids.length) {
                setViewers([]);
                setViewersVisible(true);
                return;
            }

            const details = await Promise.all(
                ids.map(async (vid) => {
                    try {
                        const userDetails = await getUserDetails(vid);
                        return userDetails || null;
                    } catch (err) {
                        console.error('Failed to fetch viewer:', vid, err);
                        return null;
                    }
                })
            );

            setViewers(details.filter(Boolean));
            setViewersVisible(true);
        } catch (e) {
            setViewers([]);
            setViewersVisible(true);
        }
    };

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

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <TopBar />

            <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background, paddingBottom: 120 }]}>
                <Image
                    source={{
                        uri: user.cover_img_path
                            ? fixLocalhostUrl(user.cover_img_path)
                            : 'https://www.dummyimage.com/1200x375/000/5a57ab&text=COVER',
                    }}
                    style={styles.coverImage}
                />


                <TouchableOpacity activeOpacity={0.9} onPress={() => setProfilePreviewVisible(true)}>
                    <Image
                        source={{
                            uri: user.profile_path
                                ? fixLocalhostUrl(user.profile_path)
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=80`,
                        }}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>


                <View style={styles.infoContainer}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.name, { color: colors.textPrimary }]}>{user?.name}</Text>
                        <Text style={[styles.username, { color: colors.textSecondary }]}>@{user?.username}</Text>
                        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
                        {user?.headline && (
                            <Text style={[styles.headline, { color: colors.accent }]}>{user.headline}</Text>
                        )}
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.background }]}>
                        <View style={styles.rowBetween}>
                            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Profile Completion</Text>
                            <Text style={[styles.cardTitle, { color: colors.accent }]}>{completionPercent}%</Text>
                        </View>
                        <View
                            style={[styles.progressTrack, { backgroundColor: colors.border }]}
                            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                        >
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        backgroundColor: colors.accent,
                                        width: trackWidth
                                            ? progressAnim.interpolate({
                                                inputRange: [0, 100],
                                                outputRange: [0, trackWidth],
                                            })
                                            : 0,
                                    },
                                ]}
                            />
                        </View>
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.background }]}>
                        <Text style={[styles.cardTitle, { color: colors.accent }]}>🧾 About</Text>
                        <View style={styles.aboutRow}><Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Name:</Text><Text style={[styles.aboutValue, { color: colors.textPrimary }]}>{user?.name}</Text></View>
                        {user?.headline ? (<View style={styles.aboutRow}><Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Headline:</Text><Text style={[styles.aboutValue, { color: colors.textPrimary }]}>{user.headline}</Text></View>) : null}
                        {user?.preferred_job_type ? (<View style={styles.aboutRow}><Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Preferred Job Type:</Text><Text style={[styles.aboutValue, { color: colors.textPrimary }]}>{user.preferred_job_type}</Text></View>) : null}
                        {user?.location ? (<View style={styles.aboutRow}><Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Location:</Text><Text style={[styles.aboutValue, { color: colors.textPrimary }]}>{user.location}</Text></View>) : null}
                        {!!user?.skills && (
                            <View style={{ marginTop: 8 }}>
                                <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Skills:</Text>
                                <View style={styles.skillWrap}>
                                    {String(user.skills).split(',').map((s: string, idx: number) => (
                                        <View key={`${s}-${idx}`} style={[styles.skillPill, { backgroundColor: colors.surface }]}>
                                            <Text style={[styles.skillText, { color: colors.textPrimary }]}>{s.trim()}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                        {user?.created_at ? (<View style={[styles.aboutRow, { marginTop: 8 }]}><Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Joined:</Text><Text style={[styles.aboutValue, { color: colors.textPrimary }]}>{formatDate(user.created_at)}</Text></View>) : null}
                    </View>

                    {userExp?.length > 0 && (
                        <View style={[styles.card, { backgroundColor: colors.background }]}>
                            <Text style={[styles.cardTitle, { color: colors.accent }]}>🧑‍💼 Experience</Text>
                            <View style={{ gap: 12 }}>
                                {userExp.map((exp: any, idx: number) => (
                                    <View key={idx} style={[styles.expItem, { backgroundColor: colors.surface }]}>
                                        <View style={styles.rowBetween}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.expRole, { color: colors.textPrimary }]}>{exp.job_title}</Text>
                                                {!!exp.company_name && (
                                                    <Text style={[styles.expCompany, { color: colors.textSecondary }]}>{exp.company_name}</Text>
                                                )}
                                            </View>
                                            <Text style={[styles.expDates, { color: colors.textSecondary }]}>
                                                {[exp.start_date, exp.end_date].filter(Boolean).join(' - ')}
                                            </Text>
                                        </View>
                                        {!!exp.description && (
                                            <Text style={[styles.expDesc, { color: colors.textPrimary }]}>{exp.description}</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}


                    <View style={[styles.card, { backgroundColor: colors.background }]}>
                        <Text style={[styles.cardTitle, { color: colors.accent }]}>📞 Contact</Text>
                        <View style={{ gap: 6 }}>
                            <Text style={[styles.contactLine, { color: colors.textPrimary }]}>Email: {user?.email}</Text>
                            {!!user?.phone && (<Text style={[styles.contactLine, { color: colors.textPrimary }]}>Phone: {user.phone}</Text>)}
                        </View>
                    </View>

                    <TouchableOpacity activeOpacity={0.8} onPress={openViewers} style={[styles.card, { backgroundColor: colors.background }]}>
                        <Text style={[styles.cardTitle, { color: colors.accent }]}>🧠 Activity</Text>
                        <Text style={[styles.contactLine, { color: colors.textPrimary }]}>👁️ Views: {viewCount ?? '—'}</Text>
                        <Text style={[styles.helper, { color: colors.textSecondary }]}>Tap to see recent viewers</Text>
                    </TouchableOpacity>

                    {!!user?.resume_link && (
                        <View style={[styles.card, { backgroundColor: colors.background }]}>
                            <Text style={[styles.cardTitle, { color: colors.accent }]}>📄 Resume</Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <Pressable onPress={() => openResume(user.resume_link)} style={[styles.button, { backgroundColor: colors.accent }]}>
                                    <Text style={[styles.buttonText, { color: '#fff' }]}>Open Resume</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal visible={viewersVisible} transparent animationType="fade" onRequestClose={() => setViewersVisible(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.rowBetween}>
                            <Text style={[styles.modalTitle, { color: colors.accent }]}>Profile Viewers</Text>
                            <TouchableOpacity onPress={() => setViewersVisible(false)}>
                                <Text style={[styles.closeText, { color: colors.textSecondary }]}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 420 }}>
                            {!viewers.length ? (
                                <View style={[styles.center, { paddingVertical: 40 }]}>
                                    <Text style={{ color: colors.textSecondary }}>No viewers yet</Text>
                                </View>
                            ) : (
                                viewers.map((v, idx) => (
                                    <View key={`${v?.id || idx}`} style={styles.viewerItem}>
                                        <Image
                                            source={{
                                                uri: v.profile
                                                    ? fixLocalhostUrl(v.profile)
                                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name || 'User')}&size=80`,
                                            }}
                                            style={styles.viewerAvatar}
                                        />

                                        <View style={{ marginLeft: 10, flex: 1 }}>
                                            <Text style={[styles.viewerName, { color: colors.textPrimary }]}>{v?.name}</Text>
                                            {!!v?.username && (<Text style={[styles.viewerUsername, { color: colors.textSecondary }]}>@{v?.username}</Text>)}
                                            {!!v?.email && (<Text style={[styles.viewerEmail, { color: colors.textSecondary }]}>{v?.email}</Text>)}
                                        </View>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={profilePreviewVisible} transparent animationType="fade" onRequestClose={() => setProfilePreviewVisible(false)}>
                <View style={styles.modalBackdrop}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setProfilePreviewVisible(false)} />
                    <View style={[styles.modalCard, { padding: 0 }]}>
                        <TouchableOpacity onPress={() => setProfilePreviewVisible(false)} style={{ position: 'absolute', right: 12, top: 12, zIndex: 2 }}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                        <Image source={{ uri: fixLocalhostUrl(user.profile_path) }} style={{ width: '100%', height: 420, borderRadius: 16 }} resizeMode="cover" />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Profile;

const styles = StyleSheet.create({
    scrollContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    coverImage: {
        width: screenWidth,
        height: 200,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#fff',
        position: 'absolute',
        top: -40,
        marginLeft: -180,
    },
    infoContainer: {
        marginTop: 80,
        alignItems: 'center',
        paddingHorizontal: 20,
        width: '100%',
        maxWidth: 720,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    username: {
        fontSize: 16,
        marginVertical: 5,
    },
    email: {
        fontSize: 16,
        marginBottom: 5,
    },
    headline: {
        fontSize: 16,
        fontStyle: 'italic',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginTop: 16,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
    },
    progressTrack: {
        width: '100%',
        height: 10,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#e5e7eb',
    },
    progressFill: {
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#2563eb',
    },
    aboutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        flexWrap: 'wrap',
    },
    aboutLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 6,
        color: '#6b7280',
    },
    aboutValue: {
        fontSize: 14,
        flexShrink: 1,
    },
    skillWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    skillPill: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#eff6ff',
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    skillText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1f2937',
    },
    expItem: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#f9fafb',
    },
    expRole: {
        fontSize: 16,
        fontWeight: '700',
    },
    expCompany: {
        fontSize: 13,
        marginTop: 2,
        color: '#6b7280',
    },
    expDates: {
        fontSize: 12,
        color: '#6b7280',
    },
    expDesc: {
        fontSize: 13,
        marginTop: 8,
        lineHeight: 18,
    },
    contactLine: {
        fontSize: 14,
    },
    helper: {
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
        color: '#6b7280',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: '#2563eb',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalCard: {
        width: '100%',
        maxWidth: 720,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    closeText: {
        fontSize: 18,
        color: '#6b7280',
    },
    viewerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
    },
    viewerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ddd',
    },
    viewerName: {
        fontSize: 15,
        fontWeight: '700',
    },
    viewerUsername: {
        fontSize: 12,
        marginTop: 2,
        color: '#6b7280',
    },
    viewerEmail: {
        fontSize: 12,
        marginTop: 2,
        color: '#6b7280',
    },
});
