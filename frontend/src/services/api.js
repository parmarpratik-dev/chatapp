import { API_URL } from '../config/config';
import axiosInstance from '../config/axiosConfig';


export const fetchConversation = async (user1, user2) => {
    const response = await axiosInstance.get(`/messages/${user1}/${user2}`);
    return response.data;
}


export const deleteMessage = async (id) => {
    const response = await axiosInstance.put(`/messages/${id}`);

    if (response.status !== 200) {
        throw new Error("Failed to delete message");
    }

    return response.data;
};


export const editMessage = async (id, senderId, receiverId, content) => {
    const response = await axiosInstance.put(
        `/messages/update/${id}`,
        {
            senderId,
            receiverId,
            content
        }
    );

    return response.data;
};


export const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice-message.webm');

    const response = await axiosInstance.post(
        `/messages/upload-audio`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
}