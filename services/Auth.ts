// services/Auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LARAVEL_API } from "./Laravel_BaseURL";


export const login = async (email: string, password: string) => {
  try {
    const res = await LARAVEL_API.post('/login', { email, password });
    if (res.data.access_token) {
      await AsyncStorage.setItem('userToken', res.data.access_token);
      return res.data;
    } else {
      throw new Error('Invalid login response');
    }
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('userToken');
};

export const getUser = async () => {
  try {
    const res = await LARAVEL_API.get('/user');
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
