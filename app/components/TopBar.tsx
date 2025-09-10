import { RootStackParamList } from "@/navigation/AppNavigator";
import { logout } from "@/services/Auth";
import { useTheme } from "@/services/Theme";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp, useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Notification from "../admin/Notification";

export default function TopBar() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { colors, toggle, current } = useTheme();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const getTitle = () => {
    switch (route.name) {
      case "Dashboard":
        return "Dashboard";
      case "Profile":
        return "Profile";
      case "Main":
        return "Home";
      default:
        return route.name as string;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.accent, paddingTop: insets.top },
      ]}
    >
      <View style={styles.titleContainer}>
        <Image
          source={require("@/assets/images/favicon.png")}
          style={[styles.logo]}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: colors.accentText }]}>
          {getTitle()}
        </Text>
      </View>

      <View style={styles.actions}>
        <Notification />
        <TouchableOpacity onPress={toggle} style={styles.actionButton}>
          <Ionicons
            name={current === "dark" ? "moon" : "sunny"}
            size={22}
            color={colors.accentText}
          />
        </TouchableOpacity>
        {route.name !== "Login" && (
          <TouchableOpacity onPress={handleLogout} style={styles.actionButton}>
            <Ionicons name="log-out-outline" size={22} color={colors.accentText} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    elevation: 5,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 27,
    height: 27,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: "#fff",

  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E40AF",
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 14,
    padding: 8,
    borderRadius: 12,

    backgroundColor: "rgba(30, 64, 175, 0.5)",
  },
});


