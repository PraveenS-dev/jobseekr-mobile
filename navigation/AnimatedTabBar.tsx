import { useTheme } from '@/services/Theme';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ICONS: Record<
	string,
	{ active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
	Dashboard: { active: 'home', inactive: 'home-outline' },
	Profile: { active: 'person', inactive: 'person-outline' },
	UserList: { active: 'people', inactive: 'people-outline' },
	JobList: { active: 'briefcase', inactive: 'briefcase-outline' },
	ChatUserList: { active: 'chatbubble', inactive: 'chatbubble-outline' },
};

export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
	const insets = useSafeAreaInsets();
	const { colors, isDark } = useTheme();
	const routes = state.routes;
	const tabWidth = useMemo(() => (SCREEN_WIDTH - 24) / Math.max(routes.length, 1), [routes.length]);

	const translateX = useRef(new Animated.Value(state.index * tabWidth)).current;

	useEffect(() => {
		Animated.spring(translateX, {
			toValue: state.index * tabWidth,
			useNativeDriver: true,
			bounciness: 12,
			speed: 16,
		}).start();
	}, [state.index, tabWidth, translateX]);

	return (
		<View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
			<View
				style={[
					styles.bar,
					{
						backgroundColor: isDark ? '#1f1f1f' : colors.surface,
						borderColor: isDark ? '#333' : colors.border,
						shadowColor: isDark ? '#000' : colors.cardShadow,
					},
				]}
			>
				{/* Active pill */}
				<Animated.View
					style={[
						styles.pill,
						{
							width: tabWidth - 16,
							transform: [{ translateX }],
							backgroundColor: colors.accent,
							shadowColor: isDark ? colors.accent : '#000',
							shadowOpacity: 0.3,
							shadowOffset: { width: 0, height: 4 },
							shadowRadius: 8,
							elevation: 6,
						},
					]}
				/>

				{routes.map((route, index) => {
					const { options } = descriptors[route.key];
					const isFocused = state.index === index;

					const onPress = () => {
						const event = navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true,
						});
						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name, route.params);
						}
					};

					const onLongPress = () => {
						navigation.emit({ type: 'tabLongPress', target: route.key });
					};

					const iconSet = ICONS[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };
					const iconName = isFocused ? iconSet.active : iconSet.inactive;

					return (
						<TouchableOpacity
							key={route.key}
							accessibilityRole="button"
							accessibilityState={isFocused ? { selected: true } : {}}
							accessibilityLabel={options.tabBarAccessibilityLabel}
							testID={options.tabBarTestID}
							onPress={onPress}
							onLongPress={onLongPress}
							style={[styles.tab, { width: tabWidth }]}
							activeOpacity={0.8}
						>
							<Animated.View
								style={[
									styles.contentCenter,
									{
										transform: [{ scale: isFocused ? 1.2 : 1 }],
									},
								]}
							>
								<Ionicons
									name={iconName}
									size={22}
									color={isFocused ? colors.accentText : colors.textSecondary}
									style={{ textShadowColor: isDark && isFocused ? colors.accent : undefined, textShadowRadius: isDark && isFocused ? 4 : 0 }}
								/>

								<Text
									style={[
										styles.label,
										{
											color: isFocused ? colors.accentText : colors.textSecondary,
											fontWeight: isFocused ? '700' : '500',
										},
									]}
								>
									{options.title ?? route.name}
								</Text>
							</Animated.View>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		left: 12,
		right: 12,
		bottom: 8,
	},
	bar: {
		borderRadius: 22,
		borderWidth: 1,
		flexDirection: 'row',
		alignItems: 'center',
		overflow: 'hidden',
		shadowOpacity: 0.15,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 8,
	},
	pill: {
		position: 'absolute',
		height: 44,
		borderRadius: 18,
		left: 8,
	},
	tab: {
		height: 56,
		justifyContent: 'center',
		alignItems: 'center',
	},
	contentCenter: {
		flexDirection: 'column',
		alignItems: 'center',
		gap: 2,
	},
	label: {
		fontSize: 11,
	},
});
