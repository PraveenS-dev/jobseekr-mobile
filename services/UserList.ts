import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LARAVEL_API } from "./Laravel_BaseURL";

export const getUserList = async (search = "", page = 1, per_page = 10) => {
  const res = await LARAVEL_API.get("/users/list", { params: { search, page, per_page } });
  return res.data.data?.usersDetails;
};

export const changeUserStatus = async (id: number, status: number) => {
  return LARAVEL_API.post("/users/statuschange", { id, types: status });
};

export const deleteUser = async (id: number) => {
  return LARAVEL_API.post("/users/deleteUser", { id });
};

export const getUserDetails = async (id: string | number) => {
  const res = await LARAVEL_API.get('/users/view', { params: { id } });
  return res.data.data?.userDetails;
};

export const getUserExp = async (id: string | number) => {
  const res = await LARAVEL_API.get('/users/exp', { params: { id } });
  return res.data.data?.userExpDetails ?? [];
};
