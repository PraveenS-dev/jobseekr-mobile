// services/Auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LARAVEL_API } from "./Laravel_BaseURL";
import { storeData, storeTokens } from './Storage';


export const login = async (email: string, password: string) => {
  try {
    const res = await LARAVEL_API.post(
      '/login',
      { email, password },
      { headers: { 'X-Client-Type': 'mobile' } }
    );

    const { access_token, refresh_token } = res.data;

    await storeTokens(access_token, refresh_token); // now both are defined

    console.log('Login success, tokens stored');

  } catch (error: any) {
    throw error.response?.data || error;
  }
};


export const logout = async () => {
  await AsyncStorage.removeItem('accessToken');
};

export const getUser = async () => {
  try {
    const res = await LARAVEL_API.get('/user');
    return res.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};


export const UserRegister = async (data: any) => {
  const res = await LARAVEL_API.post("/register", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  await storeData("accessToken",res.data.access_token);
  return res;
}

export const uniqueUserName = async (username: string) => {
  try {
    const res = await LARAVEL_API.post("/users/userNameUnique", { username });
    console.log(res.data.data.existValue);

    if (res.data.data.existValue === false) {
      return "Username already taken";
    }
    return true;
  } catch (error) {
    return "Validation failed. Try again.";
  }
};


export const uniqueEmail = async (email: string) => {
  const res = await LARAVEL_API.post('/users/emailUnique', { email });
  if (res.data.data.existValue === false) {
    return "Email already taken";
  }
  return true;
}