import React, { useEffect, useState, useRef } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Modal,
    TouchableWithoutFeedback,
    Animated,
    Easing,
} from "react-native";
import { io } from "socket.io-client";
import { getUser } from "@/services/Auth";
import { NODE_BASE_URL } from "@/services/Node_BaseURL";
import { LARAVEL_API } from "@/services/Laravel_BaseURL";
import { useTheme } from "@/services/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import TopBar from "../components/TopBar";

const socket = io(NODE_BASE_URL, {
    transports: ["websocket"],
    withCredentials: true,
});
type NotificationProp = NativeStackNavigationProp<RootStackParamList, "Notification">;


const Notification = () => {
    const { colors, isDark } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const navigation = useNavigation<NotificationProp>();

    const dropdownAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        getUser().then(setUser).catch(console.error);
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        socket.emit("join", user.id);

        socket.on("notification", (data) => {
            setNotifications((prev) => [data, ...prev]);
            setUnreadCount((c) => c + 1);
        });

        (async () => {
            const res = await LARAVEL_API.get("/notification/getNotification");
            setNotifications(res.data.data);
            const unread = res.data.data.filter((n: any) => !n.is_read).length;
            setUnreadCount(unread);
        })();

        return () => {
            socket.off("notification");
        };
    }, [user?.id]);

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
        return `${Math.floor(diff / 2592000)}mo ago`;
    };

    const toggleDropdown = (open: boolean) => {
        setIsOpen(open);
        Animated.timing(dropdownAnim, {
            toValue: open ? 1 : 0,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const markAllAsRead = async (id?: number) => {
        try {
            const res = await LARAVEL_API.post(`/notification/markAllRead`, { id: id || null });

            if (id) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
                );
                setUnreadCount((c) => Math.max(c - 1, 0));
            } else {
                setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (err: any) {
            console.log("Axios error:", err?.response?.data || err.message);
        }
    };



    const redirectPage = (id: string) => {
        if (id) navigation.navigate("ApplicationView", { id });
    };

    const handleAllNotification = () => {
        navigation.navigate('AllNotification');
    };

    const dropdownTranslate = dropdownAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 0],
    });

    const dropdownOpacity = dropdownAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <View>
            <TouchableOpacity style={styles.bellButton} onPress={() => toggleDropdown(true)}>
                <Ionicons name="notifications" size={26} color={colors.accentText || "#fff"} />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                animationType="none"
                transparent
                visible={isOpen}
                onRequestClose={() => toggleDropdown(false)}
            >
                <TouchableWithoutFeedback onPress={() => toggleDropdown(false)}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <Animated.View
                                style={[
                                    styles.dropdown,
                                    {
                                        backgroundColor: isDark ? "#1c1c1e" : "#fff",
                                        transform: [{ translateY: dropdownTranslate }],
                                        opacity: dropdownOpacity,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 10,
                                    },
                                ]}
                            >
                                <View style={[styles.header, { backgroundColor: colors.accent }]}>
                                    <Text style={styles.headerText}>Notifications</Text>
                                    <TouchableOpacity onPress={() => markAllAsRead()}>
                                        <Text style={styles.markRead}>Mark all as read</Text>
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={notifications}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => {
                                        const isUnread = !item.is_read;
                                        return (
                                            <TouchableOpacity
                                                style={[
                                                    styles.item,
                                                    {
                                                        backgroundColor: isUnread
                                                            ? isDark
                                                                ? "#0070b8" // Dark unread
                                                                : "#ace5ee" // Light unread
                                                            : isDark
                                                                ? "#2c2c2e" // Dark read
                                                                : "#f9f9f9", // Light read
                                                    },
                                                ]}
                                                onPress={() => {
                                                    markAllAsRead(item.id);
                                                    redirectPage(item.item_id);
                                                    toggleDropdown(false);
                                                }}
                                            >
                                                <View style={styles.itemRow}>
                                                    <Text
                                                        style={[
                                                            styles.itemTitle,
                                                            { color: isUnread ? colors.textPrimary : colors.textPrimary },
                                                        ]}
                                                    >
                                                        {item.title}
                                                    </Text>
                                                    <Text style={[
                                                        styles.itemTime,
                                                        { color: isUnread ? colors.textPrimary : colors.textPrimary },
                                                    ]}>{formatTimeAgo(item.created_at)}</Text>
                                                </View>
                                                <Text style={{ color: colors.textSecondary }}>{item.message}</Text>
                                            </TouchableOpacity>
                                        );
                                    }}
                                    ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
                                    style={{ maxHeight: 300 }}
                                />

                                <TouchableOpacity
                                    style={[styles.footer, { backgroundColor: colors.surface }]}
                                    onPress={() => { handleAllNotification(); toggleDropdown(false) }}
                                >
                                    <Text style={[styles.footerText, { color: colors.textPrimary }]}>View All</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback >
            </Modal >
        </View >
    );
};

export default Notification;

const styles = StyleSheet.create({
    bellButton: {
        padding: 6,
        backgroundColor: "rgba(30, 64, 175, 0.5)",
        borderRadius: 12,
    },
    badge: {
        position: "absolute",
        top: -2,
        right: -2,
        backgroundColor: "red",
        borderRadius: 12,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    badgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "bold",
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        justifyContent: "flex-start",
        paddingTop: 60, // adjust for topbar height
        paddingHorizontal: 10,
        marginTop: 90
    },
    dropdown: {
        position: "absolute",
        right: 10,
        width: 300,
        borderRadius: 12,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
    },
    headerText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    markRead: {
        color: "#fff",
        fontSize: 12,
        textDecorationLine: "underline",
    },
    item: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    itemTitle: {
        fontWeight: "bold",
        fontSize: 14,
    },
    itemTime: {
        fontSize: 12,
    },
    itemMsg: {
        marginTop: 4,
        fontSize: 13,
        color: "#555",
    },
    empty: {
        textAlign: "center",
        padding: 20,
        color: "#999",
    },
    footer: {
        padding: 12,
        alignItems: "center",
    },
    footerText: {
        fontWeight: "bold",
    },
});
