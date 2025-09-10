import { NODE_API } from "./Node_BaseURL";
import { LARAVEL_API } from "./Laravel_BaseURL";

export const getMessageUserList = async (userId: number) => {
    try {
        const res = await NODE_API.get(`/chat/user/getMessageUserList/${userId}`);
        return Array.isArray(res.data) ? res.data : [];
    } catch (e) {
        console.log(e);
    }
};

export const markAsRead = async (senderId: number, receiverId: number) => {
    await NODE_API.post(`/chat/markAsRead`, { senderId, receiverId });
};

export const getUserData = async (id: number) => {
    try {
        const res = await LARAVEL_API.get(`/users/view`, { params: { id } });
        return res.data.data?.userDetails;
    } catch (e) {
        console.log(e);
    }
};

export const getMessages = async (myUserId: number, selectedUserId: number) => {
    const res = await NODE_API.get(`/chat/${myUserId}/${selectedUserId}`);
    return Array.isArray(res.data) ? res.data : [];
};
