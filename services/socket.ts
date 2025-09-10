import { io } from "socket.io-client";
import { NODE_BASE_URL } from "./Node_BaseURL";



export const socket = io(NODE_BASE_URL, {
    transports: ["websocket"],
    autoConnect: false,
});
