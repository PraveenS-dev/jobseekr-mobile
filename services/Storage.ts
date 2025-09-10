import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
    console.log(`Data saved for key: ${key}`);
  } catch (error) {
    console.error(`Failed to save data for key: ${key}`, error);
  }
};

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch data for key: ${key}`, error);
    return null;
  }
};

export const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`Data removed for key: ${key}`);
  } catch (error) {
    console.error(`Failed to remove data for key: ${key}`, error);
  }
};
