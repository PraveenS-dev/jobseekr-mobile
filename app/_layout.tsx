import { ThemeProvider, useTheme } from "@/services/Theme";
import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "@/global.css";

function ThemedContainer({ children }: { children: React.ReactNode }) {
	const { colors } = useTheme();
	return <View style={{ flex: 1, backgroundColor: colors.background }}>{children}</View>;
}

export default function RootLayout() {
	return (
		<ThemeProvider>
			<SafeAreaProvider>
				<ThemedContainer>
					<Stack screenOptions={{ headerShown: false }} />
				</ThemedContainer>
			</SafeAreaProvider>
		</ThemeProvider>
	);
}
