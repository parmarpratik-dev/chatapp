import { API_URL } from '../config/config';
import axiosInstance from "../config/axiosConfig";


export const searchUsers = async (username) => {
    const response = await axiosInstance.get(
        `/auth/search?username=${username}`
    );

    return response.data;
};

export const sendFriendRequest = async (senderId, receiverId) => {

    const response = await axiosInstance.post(
        `/friend-request?senderId=${senderId}&receiverId=${receiverId}`
    );

    return response.data;
};

export const unfollowRequest = async (senderId, receiverId) => {
    const response = await axiosInstance.patch(
        `/friend-request/unfollow-request?senderId=${senderId}&receiverId=${receiverId}`
    );

    return response.data;
}

export const getPendingRequests = async (userId) => {
    const response = await axiosInstance.get(
        `/friend-request/pending/${userId}`
    );

    return response.data;
};

export const respondToRequest = async (requestId, accept) => {
    const endpoint = accept ? "accept" : "reject";

    const response = await axiosInstance.put(
        `/friend-request/${requestId}/${endpoint}`
    );

    return response.data;
};

export const getFriends = async (userId) => {
    const response = await axiosInstance.get(
        `/friend-request/friends/${userId}`
    );

    return response.data;
};

export const getRequestStatus = async (user1, user2) => {
    const response = await axiosInstance.get(
        `/friend-request/status?user1=${user1}&user2=${user2}`
    );

    return response.data;
};

export const cancelFriendRequest = async (requestId) => {
    const response = await axiosInstance.delete(
        `/friend-request/${requestId}`
    );

    return response.data;
};

