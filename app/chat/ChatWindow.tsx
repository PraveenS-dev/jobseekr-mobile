import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { socket } from "@/services/socket";
import { NODE_API } from "@/services/Node_BaseURL";
import TopBar from "../components/TopBar";
import { getUser } from "@/services/Auth";
import { useTheme } from "@/services/Theme";

type Props = NativeStackScreenProps<RootStackParamList, "ChatWindow">;

const ChatWindow: React.FC<Props> = ({ route }) => {
  const [me, setMe] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { colors, isDark } = useTheme();

  const { user } = route.params;
  const selectedUserId = user?.id;
  const myUserId = me?.id;

  /** Load logged-in user */
  useEffect(() => {
    (async () => {
      const loggedInUser = await getUser();
      setMe(loggedInUser);
    })();
  }, []);

  /** Connect socket */
  useEffect(() => {
    if (!me) return;
    if (!socket.connected) {
      socket.connect();
      socket.emit("join", me.id);
    }
  }, [me]);

  /** Load chat history */
  useEffect(() => {
    if (!me || !selectedUserId) return;
    (async () => {
      try {
        const res = await NODE_API.get(`/chat/${myUserId}/${selectedUserId}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
        socket.emit("markAsRead", { senderId: selectedUserId, receiverId: myUserId });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [me, selectedUserId]);

  /** Handle incoming messages */
  useEffect(() => {
    if (!me || !selectedUserId) return;

    const handleMsg = (msg: any) => {
      const isRelevant =
        (String(msg.senderId) === String(selectedUserId) && String(msg.receiverId) === String(myUserId)) ||
        (String(msg.senderId) === String(myUserId) && String(msg.receiverId) === String(selectedUserId));
      if (!isRelevant) return;

      setMessages(prev => {
        if (msg.tempId) {
          const idx = prev.findIndex(m => m.tempId === msg.tempId);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...msg, status: 2 };
            return copy;
          }
        }
        if (msg._id && prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      if (String(msg.senderId) === String(selectedUserId)) {
        socket.emit("markAsRead", { senderId: selectedUserId, receiverId: myUserId });
      }

      flatListRef.current?.scrollToEnd({ animated: true });
    };

    socket.on("PrivateMsg", handleMsg);
    return () => socket.off("PrivateMsg", handleMsg);
  }, [me, selectedUserId, myUserId]);

  /** Friend typing */
  useEffect(() => {
    if (!me || !selectedUserId) return;

    const handleTyping = ({ senderId, isTyping }: any) => {
      if (String(senderId) === String(selectedUserId)) setFriendTyping(isTyping);
    };

    socket.on("typing", handleTyping);
    return () => socket.off("typing", handleTyping);
  }, [me, selectedUserId]);

  /** Read receipts */
  useEffect(() => {
    const handleRead = ({ readerId }: any) => {
      if (String(readerId) === String(selectedUserId)) {
        setMessages(prev =>
          prev.map(msg => (msg.senderId === myUserId ? { ...msg, status: 3 } : msg))
        );
      }
    };
    socket.on("messagesRead", handleRead);
    return () => socket.off("messagesRead", handleRead);
  }, [selectedUserId, myUserId]);

  /** Emit typing */
  const emitTyping = (isTyping: boolean) => {
    if (!myUserId || !selectedUserId) return;
    socket.emit("typing", { senderId: myUserId, receiverId: selectedUserId, isTyping });
  };

  /** Handle input change */
  const handleTypingChange = (text: string) => {
    setInput(text);
    if (!typing) {
      setTyping(true);
      emitTyping(true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      emitTyping(false);
    }, 800);
  };

  /** Send message */
  const sendMessage = () => {
    if (!input.trim() || !me) return;

    const tempId = Date.now().toString();
    const tempMsg = {
      tempId,
      senderId: myUserId,
      receiverId: selectedUserId,
      text: input,
      timestamp: new Date().toISOString(),
      status: 1,
    };

    setMessages(prev => [...prev, tempMsg]);
    socket.emit("PrivateMsg", tempMsg);
    setInput("");
    emitTyping(false);
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  if (!me) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const isMine = String(item.senderId) === String(myUserId);
    return (
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isMine ? colors.accent : colors.surface,
            alignSelf: isMine ? "flex-end" : "flex-start",
            shadowColor: colors.cardShadow,
          },
        ]}
      >
        <Text style={{ color: isMine ? colors.accentText : colors.textPrimary, fontSize: 14 }}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={{ fontSize: 10, color: colors.textSecondary }}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
          {isMine && (
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 4 }}>
              {item.status === 1 ? "✓" : item.status === 2 ? "✓✓" : "✓✓✔"}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <TopBar />

      {/* User profile section */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          backgroundColor: isDark ? "#1F2937" : "#3B82F6",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#374151" : "#60A5FA",
        }}
      >
        <TouchableOpacity onPress={() => {}} style={{ marginRight: 10 }}>
          <Image
            source={{ uri: user?.profile_url || `https://ui-avatars.com/api/?name=${user?.name || "U"}&size=40` }}
            style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "#fff" }}
          />
        </TouchableOpacity>
        <View>
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            {user.name}
          </Text>
          <Text style={{ color: "#D1D5DB", fontSize: 12 }}>
            {user.online ? "🟢 Online" : "⚪ Offline"}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || item.tempId || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {friendTyping && (
        <Text style={{ fontSize: 12, fontStyle: "italic", color: colors.textSecondary, margin: 4 }}>
          Typing...
        </Text>
      )}

      {/* Input */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 8,
          backgroundColor: isDark ? "#111827" : "#F3F4F6",
        }}
      >
        <TextInput
          value={input}
          onChangeText={handleTypingChange}
          placeholder="Type a message..."
          placeholderTextColor={colors.inputPlaceholder}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 25,
            marginRight: 8,
            backgroundColor: isDark ? "#1F2937" : "#fff",
            color: colors.inputText,
          }}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 25,
            backgroundColor: colors.accent,
          }}
        >
          <Text style={{ color: colors.accentText }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatWindow;

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageBubble: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 20,
    maxWidth: "75%",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  messageFooter: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 2 },
});
