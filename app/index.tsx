import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from '@/navigation/AppNavigator';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Main'>('Login');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) setInitialRoute('Main');
      } catch (err) {
        console.error('Error checking token:', err);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <AppNavigator initialRoute={initialRoute} />
    </GestureHandlerRootView>
  );
}
