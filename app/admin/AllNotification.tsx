import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { getUser } from "@/services/Auth";
import { LARAVEL_API } from "@/services/Laravel_BaseURL";
import { useTheme } from "@/services/Theme";
import TopBar from "../components/TopBar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";


type AllNotificationProp = NativeStackScreenProps<RootStackParamList, "AllNotification">;

const AllNotification: React.FC<AllNotificationProp> = ({ route, navigation }) => {
    const { colors, isDark } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getUser().then(setUser).catch(console.error);
    }, []);

    useEffect(() => {
        if (user?.id) fetchNotifications();
    }, [user?.id]);

    const fetchNotifications = async () => {
        try {
            const res = await LARAVEL_API.get("/notification/getNotification");
            setNotifications(res.data.data);
            const unread = res.data.data.filter((n: any) => !n.is_read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.log(err);
        }
    };

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
        return `${Math.floor(diff / 2592000)}mo ago`;
    };

    const markAllAsRead = async (id?: number) => {
        try {
            await LARAVEL_API.post(`/notification/markAllRead`, { id: id || null });
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

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <TopBar />

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                        No notifications
                    </Text>
                }
                renderItem={({ item }) => {
                    const isUnread = !item.is_read;
                    return (
                        <TouchableOpacity
                            style={[
                                styles.item,
                                {
                                    backgroundColor: isUnread
                                        ? isDark
                                            ? "#0070b8"
                                            : "#ace5ee"
                                        : isDark
                                            ? "#2c2c2e"
                                            : "#f9f9f9",
                                },
                            ]}
                            onPress={() => {
                                markAllAsRead(item.id);
                                redirectPage(item.item_id);
                            }}
                        >
                            <View style={styles.itemRow}>
                                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                                    {item.title}
                                </Text>
                                <Text style={[styles.itemTime, { color: colors.textSecondary }]}>
                                    {formatTimeAgo(item.created_at)}
                                </Text>
                            </View>
                            <Text style={[styles.itemMessage, { color: colors.textSecondary }]}>
                                {item.message}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

export default AllNotification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    markRead: {
        fontSize: 14,
        textDecorationLine: "underline",
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        marginHorizontal: 10,
        borderRadius: 8,
        marginVertical: 5,
    },
    itemRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    itemTitle: {
        fontWeight: "bold",
        fontSize: 16,
    },
    itemTime: {
        fontSize: 12,
    },
    itemMessage: {
        fontSize: 14,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 50,
        fontStyle: "italic",
        fontSize: 16,
    },
});
