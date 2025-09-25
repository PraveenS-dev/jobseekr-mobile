import { LARAVEL_API } from "./Laravel_BaseURL";

export const changeUserProfileImage = async (data: any, id: number) => {
    const res = await LARAVEL_API.post('users/mobile/changeProfileimage', { image: data, id: id });
    return res;
}

export const changeUserCoverImage = async (data: any, id: number) => {
    const res = await LARAVEL_API.post('users/mobile/changeCoverimage', { image: data, id: id });
    return res;
}