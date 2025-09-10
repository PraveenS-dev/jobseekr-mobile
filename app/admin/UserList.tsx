import { fixLocalhostUrl } from "@/services/helpers";
import { useTheme } from "@/services/Theme";
import { changeUserStatus, deleteUser, getUserList } from "@/services/UserList";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import TopBar from "../components/TopBar";

const PER_PAGE_CHOICES = [5, 10, 20, 50];

const ItemRow: React.FC<{
  item: any;
  colors: any;
  onStatus: (id: string, currentStatus: number) => void;
  onDelete: (id: string) => void;
  onView: (item: any) => void;
}> = ({ item, colors, onStatus, onDelete, onView }) => {
  const fade = React.useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [fade]);

  // Determine button colors based on status
  const statusColor = item.status === 1 ? '#60A5FA' : '#2563EB'; // Blue shades
  const deleteColor = '#EF4444'; // Red
  const viewColor = colors.accent;

  return (
    <Animated.View style={{ opacity: fade }}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.cardShadow }]}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source={{ uri: item.profile_path ? fixLocalhostUrl(item.profile_path) : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&size=80` }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
            <View>
              <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>
              {!!item.email && <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{item.email}</Text>}
            </View>
          </View>
          <Text style={[styles.status, { color: item.status === 1 ? '#3B82F6' : '#2563EB' }]}>
            {item.status === 1 ? '● Active' : '● Blocked'}
          </Text>
        </View>

        {!!item.role_name && <Text style={{ color: colors.textSecondary, marginTop: 6 }}>Role: {item.role_name}</Text>}
        {!!item.created_at && <Text style={{ color: colors.textSecondary, marginTop: 2 }}>Created: {item.created_at}</Text>}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: statusColor }]}
            onPress={() => onStatus(item.id, item.status)}
          >
            <Text style={styles.buttonText}>
              {item.status === 1 ? 'Block' : 'Unblock'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: deleteColor }]}
            onPress={() => onDelete(item.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: viewColor }]}
            onPress={() => onView(item)}
          >
            <Text style={[styles.buttonText, { color: colors.accentText }]}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};


const UserListScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<{ UserProfile: { id: string } }>>();
  const [users, setUsers] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState<{ current_page?: number; total_page?: number; total?: number }>({});
  const requestIdRef = useRef(0);

  const mapUser = (u: any) => ({
    id: String(u.id),
    name: u.name,
    email: u.email ?? '',
    role_name: u.role,
    created_at: u.created_at ?? '',
    status: Number(u.status ?? 1),
    profile_path: u.profile_path,
    enc_id: u.enc_id,
  });

  const fetchUsers = useCallback(async (opts?: { background?: boolean; page?: number; per?: number; q?: string }) => {
    const background = !!opts?.background;
    const page = opts?.page ?? currentPage;
    const per = opts?.per ?? perPage;
    const q = opts?.q ?? searchTerm;
    !background ? setInitialLoading(true) : setIsFetching(true);
    const myRequestId = ++requestIdRef.current;
    try {
      const details = await getUserList(q, page, per);
      if (myRequestId !== requestIdRef.current) return;
      const list = Array.isArray(details?.list) ? details.list : Array.isArray(details) ? details : [];
      setUsers(list.map(mapUser));
      setPagination({ current_page: details?.current_page, total_page: details?.total_page, total: details?.total });
    } catch (err) {
      console.error("Error fetching users:", err);
      if (!background) Alert.alert('Error', 'Failed to load users');
    } finally {
      !background ? setInitialLoading(false) : setIsFetching(false);
    }
  }, [currentPage, perPage, searchTerm]);

  // Debounced background search (only reacts to searchTerm/perPage)
  useEffect(() => {
    const delay = setTimeout(async () => {
      setCurrentPage(1);
      setIsFetching(true);
      const myRequestId = ++requestIdRef.current;
      try {
        const details = await getUserList(searchTerm, 1, perPage);
        if (myRequestId !== requestIdRef.current) return;
        const list = Array.isArray(details?.list) ? details.list : Array.isArray(details) ? details : [];
        setUsers(list.map(mapUser));
        setPagination({ current_page: details?.current_page, total_page: details?.total_page, total: details?.total });
      } catch (err) {
        console.error('Error fetching users (debounced):', err);
      } finally {
        setIsFetching(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm, perPage]);

  // First load or page change
  useEffect(() => {
    fetchUsers({ background: false });
  }, [currentPage]);

  const handleStatusChange = async (id: string, currentStatus: number) => {
    const actionText = currentStatus === 1 ? 'block' : 'unblock';
    Alert.alert(
      'Confirm',
      `Do you want to ${actionText} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: currentStatus === 1 ? 'Block' : 'Unblock',
          style: 'destructive',
          onPress: async () => {
            // optimistic
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status: currentStatus === 1 ? 0 : 1 } : u));
            try {
              await changeUserStatus(Number(id), currentStatus);
            } catch (e) {
              // revert
              setUsers(prev => prev.map(u => u.id === id ? { ...u, status: currentStatus } : u));
              Alert.alert('Error', 'Failed to change status');
            }
          }
        }
      ]
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete user',
      'Do you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            const prev = users;
            setUsers(prev.filter(u => u.id !== id));
            try {
              await deleteUser(Number(id));
            } catch (e) {
              setUsers(prev); // revert
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const handleView = (item: any) => {
    const id = String(item.enc_id ?? item.id);
    navigation.navigate('UserProfile', { id });
  };

  const renderItem = ({ item }: { item: any }) => (
    <ItemRow item={item} colors={colors} onStatus={handleStatusChange} onDelete={handleDelete} onView={handleView} />
  );

  const ListEmpty = () => (
    <View style={{ paddingVertical: 32, alignItems: 'center' }}>
      <Text style={{ color: colors.textSecondary }}>No users found</Text>
    </View>
  );

  const totalPages = Math.max(1, Number(pagination.total_page) || 1);
  const current = Math.max(1, Math.min(Number(pagination.current_page) || currentPage, totalPages));

  const pageButtons = Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
    const page = i + 1;
    const active = page === current;
    return (
      <TouchableOpacity key={page} onPress={() => setCurrentPage(page)} style={[styles.pageBtn, { borderColor: active ? colors.accent : colors.border, backgroundColor: active ? colors.accent : colors.surface }]}>
        <Text style={{ color: active ? colors.accentText : colors.textPrimary }}>{page}</Text>
      </TouchableOpacity>
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar />

      {/* Search + Per Page */}
      <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={[styles.searchWrapper, { borderColor: colors.border, backgroundColor: colors.inputBackground, flex: 1 }]}>
            <TextInput
              placeholder="Search users..."
              placeholderTextColor={colors.inputPlaceholder}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={[styles.searchInput, { color: colors.inputText }]}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => fetchUsers({ background: true, page: 1 })}
            />
            {isFetching && (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: 8 }} />
            )}
          </View>

          {/* Reset */}
          <TouchableOpacity onPress={() => { setSearchTerm(''); setCurrentPage(1); fetchUsers({ background: true, page: 1, q: '' }); }} style={[styles.smallBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.textPrimary }}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Per page chips */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {PER_PAGE_CHOICES.map(n => {
            const active = perPage === n;
            return (
              <TouchableOpacity key={n} onPress={() => { setPerPage(n); setCurrentPage(1); fetchUsers({ background: true, page: 1, per: n }); }} style={[styles.chip, { borderColor: active ? colors.accent : colors.border, backgroundColor: active ? colors.accent : colors.surface }]}>
                <Text style={{ color: active ? colors.accentText : colors.textPrimary }}>{n}/page</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {initialLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 140, paddingTop: 8, paddingHorizontal: 12 }}
          ListEmptyComponent={ListEmpty}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={[styles.paginationBar, { backgroundColor: 'transparent' }]}>
          <TouchableOpacity disabled={current <= 1} onPress={() => setCurrentPage(p => Math.max(1, p - 1))} style={[styles.pageBtn, { opacity: current <= 1 ? 0.5 : 1, borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.textPrimary }}>Prev</Text>
          </TouchableOpacity>
          {pageButtons}
          <TouchableOpacity disabled={current >= totalPages} onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))} style={[styles.pageBtn, { opacity: current >= totalPages ? 0.5 : 1, borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.textPrimary }}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default UserListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smallBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#fff",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
  },
  status: {
    fontWeight: "600",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  paginationBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 110,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
  },
});
