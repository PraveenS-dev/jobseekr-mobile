import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { getUser } from '@/services/Auth';
import { useTheme } from '@/services/Theme';
import { getMessageUserList as fetchMessageUserList, getUserData as fetchUserData } from '@/services/Chat';

type ChatUserListProps = NativeStackScreenProps<RootStackParamList, "ChatUserList">

const ChatUserList: React.FC<ChatUserListProps> = ({ navigation }) => {
  const [me, setMe] = useState<any>(null);
  const [userList, setUserList] = useState<any>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]); // For online status
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  const { colors, isDark } = useTheme();

  // Get logged-in user
  useEffect(() => {
    getUser().then(setMe).catch(console.error);
  }, []);

  // Fetch chat users
  useEffect(() => {
    if (!me) return;

    const getMessageUserList = async () => {
      try {
        const chats = await fetchMessageUserList(me.id); // Returns user IDs and unread counts
        if (!Array.isArray(chats)) return;

        const tempUserList: any[] = [];
        const tempUnread: { [key: string]: number } = {};

        for (const chat of chats) {
          tempUnread[chat._id] = chat.unreadCount || 0;

          const userDetails = await fetchUserData(chat._id);
          if (userDetails) tempUserList.push(userDetails);
        }

        setUnreadCounts(tempUnread);
        setUserList(tempUserList);

      } catch (err) {
        console.error("Failed to fetch chat list", err);
      }
    };

    getMessageUserList();
  }, [me]);

  /** Simulate online users — replace this with socket logic */
  useEffect(() => {
    // Example: online users from your backend/socket
    setOnlineUserIds(userList.slice(0, 2).map(u => u.id.toString())); 
  }, [userList]);

  const renderItem = ({ item }: { item: any }) => {
    const isOnline = onlineUserIds.includes(String(item.id));
    const unread = unreadCounts[item.id] || 0;

    return (
      <TouchableOpacity
        style={[styles.item, { backgroundColor: isDark ? '#1F2937' : '#fff' }]}
        onPress={() => navigation.navigate("ChatWindow", { user: item })}
      >
        {/* Profile + Online Indicator */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: item.profile_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "U")}&size=100` }}
            style={styles.avatar}
          />
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: isOnline ? '#22c55e' : '#9ca3af' }
            ]}
          />
        </View>

        {/* Name + Status */}
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: isDark ? '#fff' : '#111827' }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.status, { color: isOnline ? '#22c55e' : '#6b7280' }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        {/* Unread Badge */}
        {unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unread > 99 ? '99+' : unread}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <TopBar />
      <View style={styles.container}>
        <FlatList
          data={userList}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      </View>
    </View>
  );
};

export default ChatUserList;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  profileContainer: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  onlineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff', position: 'absolute', bottom: 0, right: 0 },
  textContainer: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 12 },
  unreadBadge: { backgroundColor: '#ef4444', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
  unreadText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});
