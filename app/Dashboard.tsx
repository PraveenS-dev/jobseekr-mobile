import { getUser } from '@/services/Auth';
import { useTheme } from '@/services/Theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '.';
import TopBar from './components/TopBar';

type DashboardScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'Dashboard'
>;

type Props = {
    navigation: DashboardScreenNavigationProp;
};

export default function Dashboard({ navigation }: Props) {
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();

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

    if (loading) {
        return (
            <View style={[styles.loaderContainer, { backgroundColor: colors.background }] }>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }] }>
            <TopBar />
            <View style={styles.content}>
                <Text style={[styles.welcome, { color: colors.textPrimary }]}>
                    Welcome {user?.name} 👋
                </Text>
                <Text style={{ color: colors.textSecondary, marginBottom: 32 }}>
                    You are now logged in.
                </Text>
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.cardShadow }] }>
                    <Text style={{ color: colors.textPrimary, fontWeight: '600', marginBottom: 6 }}>Quick Tips</Text>
                    <Text style={{ color: colors.textSecondary }}>Explore jobs, update your profile, and manage applications.</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
    },
    loaderContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    content: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 24,
    },
    welcome: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 10,
    },
    card: {
        width: '90%',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        elevation: 1,
    },
});

