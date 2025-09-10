import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const LARAVEL_URL = process.env.EXPO_PUBLIC_LARAVEL_URL;

export const LARAVEL_BASE_URL = LARAVEL_URL;

export const LARAVEL_API = axios.create({
  baseURL: `${LARAVEL_BASE_URL}/api`,
});

LARAVEL_API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
