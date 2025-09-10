import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const NODE_URL = process.env.EXPO_PUBLIC_NODE_URL;
export const NODE_BASE_URL = NODE_URL;

export const NODE_API = axios.create({
  baseURL: `${NODE_BASE_URL}/api`,
});

NODE_API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
